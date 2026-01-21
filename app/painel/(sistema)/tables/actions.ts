'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateTableCountAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const totalMesas = parseInt(formData.get('totalMesas') as string);

  try {
    await prisma.config.update({
      where: { id },
      data: { totalMesas }
    });
    
    revalidatePath('/painel/tables');
    revalidatePath('/painel/dashboard');
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar quantidade." };
  }
}