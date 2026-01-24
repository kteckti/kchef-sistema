'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// --- FUNÇÃO CORRIGIDA: Busca Empresa pelo ID direto ---
async function getEmpresaId() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('painel_session')?.value;

  console.log("--- DEBUG: BUSCANDO ID DA EMPRESA ---");

  if (sessionCookie) {
    try {
      let empresaIdNoCookie;

      // 1. Tenta ler o ID de dentro do Cookie (Seja JSON ou Número puro)
      if (sessionCookie.trim().startsWith('{')) {
        const session = JSON.parse(sessionCookie);
        empresaIdNoCookie = session.id; 
      } else {
        empresaIdNoCookie = sessionCookie;
      }

      console.log("1. ID lido do cookie:", empresaIdNoCookie);

      if (empresaIdNoCookie) {
        // 2. BUSCA POR ID (Conforme solicitado)
        // Verificamos se essa empresa realmente existe no banco
        const config = await prisma.config.findUnique({
          where: { id: Number(empresaIdNoCookie) } // <--- ALTERADO DE idu PARA id
        });

        if (config) {
          console.log("2. SUCESSO! Empresa confirmada:", config.nomeempresa, "| ID:", config.id);
          return config.id;
        } else {
          console.log("2. ERRO: ID do cookie não bate com nenhuma empresa na tabela Config.");
        }
      }

    } catch (e) {
      console.error("ERRO ao processar cookie:", e);
    }
  } else {
    console.log("AVISO: Cookie 'painel_session' não encontrado.");
  }

  // FALLBACK: Se der erro, usa ID 1 (Sua empresa principal)
  console.log("3. Usando ID 1 como padrão.");
  return 1;
}

// --- AS OUTRAS FUNÇÕES CONTINUAM IGUAIS ---

export async function getFuncionarios() {
  const idu = await getEmpresaId();
  
  // Busca funcionários vinculados a esta empresa (idu = id da empresa)
  return await prisma.funcionario.findMany({
    where: { idu: idu },
    orderBy: { nome: 'asc' }
  });
}

export async function excluirFuncionario(id: number) {
  try {
    const idu = await getEmpresaId();
    
    const apagado = await prisma.funcionario.deleteMany({
      where: { 
        id: Number(id),
        idu: idu 
      }
    });

    if (apagado.count === 0) {
      return { error: "Erro: Funcionário não encontrado." };
    }

    revalidatePath('/painel/funcionarios');
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir." };
  }
}

export async function salvarFuncionario(formData: FormData) {
  try {
    const idu = await getEmpresaId(); // Pega o ID da empresa (ex: 1)
    
    const id = formData.get('id');
    const nome = formData.get('nome') as string;
    const login = formData.get('login') as string;
    const senha = formData.get('senha') as string;
    const funcao = formData.get('funcao') as string;

    if (!nome || !login || !funcao) {
      return { error: "Preencha todos os campos obrigatórios." };
    }

    // Verifica se login já existe nesta empresa
    const existente = await prisma.funcionario.findFirst({
      where: { 
        idu: idu, 
        login: login,
        NOT: id ? { id: Number(id) } : undefined
      }
    });

    if (existente) {
      return { error: `O login '${login}' já existe na sua empresa.` };
    }

    const dados: any = {
      idu: idu, // Salva o ID da empresa (1) no funcionário
      nome,
      login,
      funcao
    };

    if (senha && senha.trim() !== '') {
      const hash = await bcrypt.hash(senha, 10);
      dados.senha = hash;
    } else if (!id) {
      return { error: "Senha obrigatória para novo cadastro." };
    }

    if (id) {
      await prisma.funcionario.update({
        where: { id: Number(id) },
        data: dados
      });
    } else {
      await prisma.funcionario.create({
        data: dados
      });
    }

    revalidatePath('/painel/funcionarios');
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar funcionário." };
  }
}