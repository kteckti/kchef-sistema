'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../src/lib/prisma'; 
import crypto from 'crypto';

export async function loginAction(prevState: any, formData: FormData) {
  const login = formData.get('login') as string;
  const password = formData.get('password') as string;

  console.log("--- TENTATIVA DE LOGIN ADMIN ---");
  console.log("Login digitado:", login);

  if (!login || !password) {
    return { error: "Preencha todos os campos" };
  }

  try {
    // 1. Busca o usuário
    const user = await prisma.adm.findFirst({
      where: { login: login }
    });

    if (!user) {
      console.log("ERRO: Usuário não encontrado no banco Adm.");
      return { error: "Usuário não encontrado." };
    }

    console.log("Usuário encontrado (ID):", user.id);
    console.log("Senha no Banco (Hash):", user.senha);

    // 2. Verifica Bloqueio
    if (user.bloqueado_ate) {
      const agora = new Date();
      if (user.bloqueado_ate > agora) {
        return { error: `Conta bloqueada temporariamente.` };
      }
    }

    // 3. Verifica Senha
    const shasum = crypto.createHash('sha1');
    shasum.update(password);
    const senhaHash = shasum.digest('hex');

    console.log("Senha Digitada (123...):", password);
    console.log("Hash Gerado pelo Node:", senhaHash);

    if (user.senha === senhaHash) {
      console.log("SUCESSO: As senhas batem!");

      // Zera tentativas
      await prisma.adm.update({
        where: { id: user.id },
        data: { tentativas: 0, bloqueado_ate: null }
      });

      // Cria Cookie 'admin_session'
      cookies().set('admin_session', user.id.toString(), { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/' 
      });

      return { success: true };

    } else {
      console.log("ERRO: As senhas NÃO batem.");
      
      // Lógica de Bloqueio simplificada para teste
      await prisma.adm.update({
        where: { id: user.id },
        data: { tentativas: (user.tentativas || 0) + 1 }
      });

      return { error: "Senha incorreta." };
    }

  } catch (err) {
    console.error("ERRO CRÍTICO DO PRISMA:", err);
    return { error: "Erro interno no servidor." };
  }
}

// ... mantenha as outras funções (update, logout) iguais ...