'use server'

import { prisma } from '../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Criar Grupo
export async function createGroupAction(formData: FormData) {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) return { error: "Sessão inválida" };

  const nomeinterno = formData.get('nomeinterno') as string;
  const nomegrupo = formData.get('nomegrupo') as string;
  const posicao = formData.get('posicao') as string;
  const quantidade = formData.get('quantidade') as string;
  const obrigatorio = formData.get('obrigatorio') as string;

  if (!nomeinterno || !nomegrupo) return { error: "Preencha os nomes." };

  try {
    await prisma.grupo.create({
      data: {
        idu: parseInt(lojaId),
        nomeinterno,
        nomegrupo,
        posicao: parseInt(posicao) || 0,
        quantidade: parseInt(quantidade) || 1, // Quantos itens pode escolher
        obrigatorio: parseInt(obrigatorio) || 1, // 1=Obrigatório, 2=Máximo
        status: 1
      }
    });
    revalidatePath('/painel/groups');
    return { success: true, message: "Grupo criado!" };
  } catch (e) {
    return { error: "Erro ao criar grupo." };
  }
}

// Deletar Grupo
export async function deleteGroupAction(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.grupo.delete({ where: { id: parseInt(id) } });
  revalidatePath('/painel/groups');
}