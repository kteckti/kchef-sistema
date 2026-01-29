'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- 1. ABRIR MESA (LOGIN) ---
export async function abrirMesaAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const celular = formData.get('celular') as string;
  const slug = formData.get('slug') as string;
  const mesaId = formData.get('mesaId') as string;

  // Debug: Verifique no terminal do VS Code se o celular está chegando aqui
  console.log(`[LOGIN] Abrindo mesa ${mesaId} para: ${nome}, Celular: ${celular}`);

  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  
  if (!empresa) {
    return { error: "Empresa não encontrada" };
  }

  const cookieStore = cookies();
  
  // 1. Grava Cookie do Nome
  cookieStore.set(`comanda_nome_${slug}_${mesaId}`, nome, {
    maxAge: 60 * 60 * 12, // 12 horas
    path: '/',
  });

  // 2. Grava Cookie do Celular (SEMPRE que tiver valor)
  if (celular && celular.trim() !== '') {
    cookieStore.set(`comanda_celular_${slug}_${mesaId}`, celular, {
      maxAge: 60 * 60 * 12,
      path: '/',
    });
  }

  // 3. Redireciona
  redirect(`/${slug}/mesa/${mesaId}/cardapio`);
}

// --- 2. ENCERRAR SESSÃO (LOGOUT) ---
export async function encerrarSessaoAction(slug: string, mesaId: string) {
  const cookieStore = cookies();
  
  // Nomes dos cookies
  const cookieNome = `comanda_nome_${slug}_${mesaId}`;
  const cookieCelular = `comanda_celular_${slug}_${mesaId}`; // <--- FALTAVA ISSO
  
  const empresa = await prisma.config.findUnique({ where: { url: slug } });

  if (empresa) {
    // Marca pedidos pendentes como finalizados para liberar a mesa (opcional, manter se for sua regra)
    await prisma.pedido.updateMany({
      where: {
        idu: empresa.id,
        mesa: mesaId,
        status: { in: [1, 2, 3] }
      },
      data: { status: 4 }
    });
  }

  // DELETA AMBOS OS COOKIES PARA LIMPAR A SESSÃO DE VEZ
  cookieStore.delete(cookieNome);
  cookieStore.delete(cookieCelular);

  redirect(`/${slug}/mesa/${mesaId}`);
}

// --- 3. BUSCAR HISTÓRICO (FILTRO CORRIGIDO) ---
export async function buscarHistoricoPedidos(
  slug: string, 
  mesaId: string, 
  nomeCliente: string, 
  celularCliente: string
) {
  try {
    const empresa = await prisma.config.findUnique({ where: { url: slug } });
    if (!empresa) return [];

    console.log(`[HISTORICO] Buscando para ${nomeCliente}. Celular: [${celularCliente}]`);

    // --- CORREÇÃO AQUI ---
    // Removemos 'celular_cliente' desta lista inicial.
    // Deixamos apenas o que é OBRIGATÓRIO para todos (Loja, Mesa, Nome e Status).
    const whereClause: any = {
        idu: empresa.id,
        mesa: mesaId,
        nome_cliente: nomeCliente,
        // celular_cliente: celularCliente, <--- ESTA LINHA FOI REMOVIDA
        status: { in: [1, 2, 3, 4] }
    };

    // Agora o IF abaixo controla totalmente a lógica do celular:
    // "Ou é igual ao meu celular, OU é vazio (pedido antigo)"
    if (celularCliente && celularCliente.trim() !== '') {
        whereClause.OR = [
            { celular_cliente: celularCliente },
            { celular_cliente: '' }
        ];
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      include: {
        itens: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const pedidosFormatados = pedidos.map((pedido) => ({
      ...pedido,
      taxa_entrega: Number(pedido.taxa_entrega),
      subtotal: Number(pedido.subtotal),
      total: Number(pedido.total),
      itens: pedido.itens.map((item) => ({
        ...item,
        valor_unit: Number(item.valor_unit),
        total_item: Number(item.total_item)
      }))
    }));

    return pedidosFormatados;

  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}

export async function solicitarFechamentoMesa(slug: string, mesaId: string, nome: string, celular: string) {
  try {
    // 1. Busca a empresa pelo slug para garantir que estamos mexendo na loja certa
    const empresa = await prisma.config.findUnique({
      where: { url: slug }
    });

    if (!empresa) {
      return { error: "Empresa não encontrada." };
    }

    // 2. Define o intervalo do dia (Hoje) para não pegar pedidos de ontem
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. MUDANÇA PRINCIPAL: Atualiza os pedidos ativos para Status 9 (Conta Solicitada)
    // Afeta status 1 (Novo), 2 (Preparo) e 3 (Entrega/Mesa)
    const update = await prisma.pedido.updateMany({
      where: {
        idu: empresa.id,
        mesa: mesaId,
        status: { in: [1, 2, 3] }, 
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      data: {
        status: 9 // <--- ESSE STATUS FAZ APARECER NA COLUNA AMARELA DO PDV
      }
    });

    // 4. Se nenhum registro foi atualizado, verificamos o motivo
    if (update.count === 0) {
      // Verifica se já existe algum pedido com status 9 (para não dar erro se o cliente clicar 2x)
      const jaSolicitado = await prisma.pedido.count({
        where: {
             idu: empresa.id, 
             mesa: mesaId, 
             status: 9, 
             createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });
      
      if (jaSolicitado > 0) {
         // Se já pediu, apenas retornamos sucesso para não assustar o cliente
         const pedidosJaSolicitados = await prisma.pedido.findMany({
            where: { idu: empresa.id, mesa: mesaId, status: 9, createdAt: { gte: startOfDay, lte: endOfDay } }
         });
         const totalJaSolicitado = pedidosJaSolicitados.reduce((acc, p) => acc + Number(p.total), 0);
         
         return { 
            success: true, 
            total: totalJaSolicitado,
            message: `A conta já foi solicitada. Total: R$ ${totalJaSolicitado.toFixed(2).replace('.', ',')}. Aguarde o garçom.` 
         };
      }
      
      return { error: "Nenhum pedido em aberto encontrado para esta mesa hoje." };
    }

    // 5. Busca os pedidos atualizados para somar o total e mostrar ao cliente
    const pedidosAtualizados = await prisma.pedido.findMany({
        where: {
            idu: empresa.id,
            mesa: mesaId,
            status: 9,
            createdAt: { gte: startOfDay, lte: endOfDay }
        }
    });
    
    const totalConta = pedidosAtualizados.reduce((acc, pedido) => acc + Number(pedido.total), 0);

    // 6. Atualiza o PDV dos garçons em tempo real
    revalidatePath(`/${slug}/pdv`);
    
    return { 
      success: true, 
      total: totalConta,
      message: `Conta solicitada com sucesso! Total: R$ ${totalConta.toFixed(2).replace('.', ',')}. O garçom levará a maquininha.` 
    };

  } catch (error) {
    console.error("Erro ao fechar mesa:", error);
    return { error: "Erro ao processar solicitação. Chame o garçom." };
  }
}