'use server'

import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function logoutStaffAction(slug: string, mesaId: string, senhaConfirmacao: string) {
  const cookieStore = cookies();
  const cookieName = `staff_session_${slug}_${mesaId}`;
  const sessionCookie = cookieStore.get(cookieName)?.value;

  if (!sessionCookie) {
    // Se não tem cookie, já está deslogado, apenas redireciona
    return { success: true }; 
  }

  try {
    const session = JSON.parse(sessionCookie);

    // 1. Busca o funcionário no banco para validar a senha atual
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: session.id }
    });

    if (!funcionario) {
      // Se o usuário foi deletado do banco, forçamos o logout
      cookieStore.delete(cookieName);
      return { success: true };
    }

    // 2. Verifica a senha digitada
    const senhaValida = await bcrypt.compare(senhaConfirmacao, funcionario.senha);

    if (!senhaValida) {
      return { error: "Senha incorreta. Logout cancelado." };
    }

    // 3. Se a senha está certa, apaga o cookie
    cookieStore.delete(cookieName);
    
    // Retornamos sucesso para o componente fazer o redirect no cliente (melhor UX)
    // ou fazemos redirect aqui mesmo se preferir, mas vamos retornar flag de sucesso.
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao processar logout." };
  }
}