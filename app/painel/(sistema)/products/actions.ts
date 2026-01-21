'use server'

import { prisma } from '@/src/lib/prisma'; // Verifique se o caminho do alias @ está correto no seu projeto
import { revalidatePath } from 'next/cache';
import path from 'path';
import { writeFile } from 'fs/promises';

// --- FUNÇÃO AUXILIAR DE UPLOAD ---
async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Gera nome único: timestamp_nomeriginal.jpg
  // Remove espaços para evitar erros de URL
  const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  
  const uploadDir = path.join(process.cwd(), 'public/img/fotos_produtos');
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);
  return fileName;
}

// --- CRIAR PRODUTO ---
export async function createProductAction(formData: FormData) {
  try {
    const cookieStore = require('next/headers').cookies();
    const lojaId = cookieStore.get('painel_session')?.value;
    
    if (!lojaId) return { error: "Sessão inválida ou expirada." };

    const nome = formData.get('nome') as string;
    const valor = parseFloat(formData.get('valor') as string);
    const categoria = parseInt(formData.get('categoria') as string);
    const visivel = formData.getAll('visivel').join(','); 
    
    // 1. Processa a Imagem
    const file = formData.get('foto') as File;
    const nomeFoto = await uploadImage(file);

    await prisma.produto.create({
      data: {
        idu: parseInt(lojaId),
        categoriaId: categoria,
        nome,
        valor,
        visivel: visivel || 'G',
        status: 1,
        foto: nomeFoto, 
      }
    });

    revalidatePath('/painel/products');
    
    return { success: true, message: "Produto cadastrado com sucesso!" };

  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { error: "Erro interno ao cadastrar produto." };
  }
}

// --- ATUALIZAR PRODUTO ---
export async function updateProductAction(formData: FormData) {
  try {
    const id = parseInt(formData.get('id') as string);
    const nome = formData.get('nome') as string;
    const valor = parseFloat(formData.get('valor') as string);
    const categoria = parseInt(formData.get('categoria') as string);
    
    // Checkboxes dias da semana
    const visivel = formData.getAll('visivel').join(',');

    // 1. Processa a Nova Imagem (se houver)
    const file = formData.get('foto') as File;
    const novaFoto = await uploadImage(file);

    // Objeto de atualização base
    const dataUpdate: any = {
      categoriaId: categoria,
      nome,
      valor,
      visivel: visivel || 'G',
    };

    // Se o usuário mandou uma foto nova, atualizamos o campo
    if (novaFoto) {
      dataUpdate.foto = novaFoto;
      // (Opcional) Futuramente você pode deletar a foto antiga aqui usando fs.unlink
    }

    await prisma.produto.update({
      where: { id },
      data: dataUpdate
    });

    revalidatePath('/painel/products');
    
    // Não usamos redirect() aqui para permitir que o Front mostre o Toast de sucesso primeiro
    return { success: true, message: "Produto atualizado com sucesso!" };

  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { error: "Erro interno ao atualizar produto." };
  }
}

// --- DELETAR PRODUTO ---
export async function deleteProductAction(formData: FormData) {
  const id = formData.get('id') as string;
  
  try {
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    revalidatePath('/painel/products');
    return { success: true, message: "Produto excluído com sucesso." };
  } catch (err) {
    console.error(err);
    return { error: "Erro ao excluir produto. Verifique se ele não possui vendas vinculadas." };
  }
}

// --- ALTERAR STATUS (ATIVO/INATIVO) ---
export async function toggleProductStatusAction(id: number, currentStatus: number) {
  try {
    const novoStatus = currentStatus === 1 ? 2 : 1;
    await prisma.produto.update({
      where: { id },
      data: { status: novoStatus }
    });
    revalidatePath('/painel/products');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao alterar status." };
  }
}

// --- ATUALIZAR VISIBILIDADE (DIAS DA SEMANA) ---
export async function updateVisibilityAction(formData: FormData) {
  const id = formData.get('id') as string;
  const days = formData.getAll('days') as string[]; 

  if (!id) return { error: "ID inválido." };

  let valorParaSalvar = 'G';

  if (days.includes('G') || days.length === 0) {
    valorParaSalvar = 'G';
  } else {
    valorParaSalvar = days.join(',');
  }

  try {
    await prisma.produto.update({
      where: { id: parseInt(id) },
      data: { visivel: valorParaSalvar }
    });

    revalidatePath('/painel/products');
    return { success: true, message: "Dias de exibição atualizados!" };
  } catch (err) {
    return { error: "Erro ao atualizar visibilidade." };
  }
}