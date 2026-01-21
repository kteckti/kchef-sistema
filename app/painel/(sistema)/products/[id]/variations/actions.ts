'use server'

import { prisma } from '../../../../../../src/lib/prisma';
import { revalidatePath } from 'next/cache';

// Criar Variação
export async function createVariationAction(formData: FormData) {
  const descricao = formData.get('descricao') as string;
  const valorRaw = formData.get('valor') as string;
  const produtoId = formData.get('produtoId') as string;

  // Validação simples
  if (!descricao || !valorRaw || !produtoId) {
    return { error: "Preencha todos os campos." };
  }

  // Tratamento do valor (R$ 1.500,00 -> 1500.00)
  // Remove tudo que não é dígito ou vírgula, depois troca vírgula por ponto
  const valorLimpo = valorRaw.replace(/[^\d,]/g, '').replace(',', '.');
  const valorFinal = parseFloat(valorLimpo);

  try {
    await prisma.tamanho.create({
      data: {
        produtoId: parseInt(produtoId),
        descricao: descricao, // Nome correto do banco
        valor: valorFinal,    // Nome correto do banco
        status: 1
      }
    });

    revalidatePath(`/painel/products/${produtoId}/variations`);
    return { success: true, message: "Variação adicionada com sucesso!" };

  } catch (e) {
    console.error(e);
    return { error: "Erro ao salvar no banco de dados." };
  }
}

// Deletar Variação
export async function deleteVariationAction(formData: FormData) {
  const id = formData.get('id') as string;
  const produtoId = formData.get('produtoId') as string;
  
  await prisma.tamanho.delete({ where: { id: parseInt(id) } });
  revalidatePath(`/painel/products/${produtoId}/variations`);
}

// Alternar Status
export async function toggleVariationStatusAction(id: number, currentStatus: number, produtoId: number) {
  await prisma.tamanho.update({
    where: { id },
    data: { status: currentStatus === 1 ? 2 : 1 }
  });
  revalidatePath(`/painel/products/${produtoId}/variations`);
}