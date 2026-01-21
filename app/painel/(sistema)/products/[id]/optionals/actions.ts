'use server'

import { prisma } from '../../../../../../src/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function linkGroupAction(formData: FormData) {
  const produtoId = parseInt(formData.get('produtoId') as string);
  const grupoId = parseInt(formData.get('grupoId') as string);

  // Evitar duplicidade
  const exists = await prisma.produtoGrupo.findFirst({
    where: { idp: produtoId, idgrupo: grupoId }
  });

  if (!exists) {
    await prisma.produtoGrupo.create({
      data: { idp: produtoId, idgrupo: grupoId }
    });
  }
  
  revalidatePath(`/painel/products/${produtoId}/optionals`);
}

export async function unlinkGroupAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string); // ID do Vínculo
  const produtoId = formData.get('produtoId') as string;
  
  await prisma.produtoGrupo.delete({ where: { id } });
  revalidatePath(`/painel/products/${produtoId}/optionals`);
}