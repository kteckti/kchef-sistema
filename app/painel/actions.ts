'use server'

import { cookies } from 'next/headers';
import { prisma } from '../../src/lib/prisma'; 
import crypto from 'crypto';
import { redirect } from 'next/navigation';

export async function lojaLoginAction(prevState: any, formData: FormData) {
  const cpf = formData.get('cpf') as string;
  const password = formData.get('password') as string;

  if (!cpf || !password) {
    return { error: "Preencha todos os campos" };
  }

  // Criptografia SHA1 (Padrão do seu sistema legado)
  const shasum = crypto.createHash('sha1');
  shasum.update(password);
  const senhaHash = shasum.digest('hex');

  try {
    // Busca na tabela CONFIG (Clientes) e verifica se status é 1 (Ativo)
    const user = await prisma.config.findFirst({
      where: {
        cpf: cpf,         // No PHP era 'loginCPF' -> banco 'cpf'
        senha: senhaHash,
        status: 1         // Apenas ativos
      }
    });

    if (user) {
      // Cria o cookie específico da loja
      cookies().set('painel_session', user.id.toString(), { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 dias (no PHP era 90)
        path: '/' 
      });

      if (user.trocar_senha === 1) {
         return { requirePasswordChange: true, userId: user.id };
      }

      return { success: true };
    } else {
      return { error: "CPF ou senha incorretos, ou conta inativa." };
    }
  } catch (err: any) {
    // --- CORREÇÃO IMPORTANTE DO REDIRECT ---
    // O Next.js usa um erro para fazer o redirect. Se cair no catch,
    // precisamos jogar o erro para cima novamente, senão o redirect não acontece.
    if (err.message === 'NEXT_REDIRECT') {
        throw err;
    }
    console.error(err);
    return { error: "Erro interno no servidor." };
  }
}   

export async function lojaLogoutAction() {
  cookies().delete('painel_session');
  // Redireciona para o login da loja
  // Usamos redirect no componente client-side para forçar reload
}

// --- NOVA ACTION: SALVAR A NOVA SENHA ---
export async function updatePasswordFirstAccess(formData: FormData) {
  const novaSenha = formData.get('novaSenha') as string;
  const confirmSenha = formData.get('confirmSenha') as string;
  
  // Pegamos o ID do cookie para garantir segurança (o usuário já logou no passo anterior)
  const cookieStore = cookies();
  const userId = cookieStore.get('painel_session')?.value;

  if (!userId) return { error: "Sessão expirada." };
  if (novaSenha !== confirmSenha) return { error: "As senhas não coincidem." };
  if (novaSenha.length < 4) return { error: "A senha deve ter no mínimo 4 caracteres." };

  const shasum = crypto.createHash('sha1');
  shasum.update(novaSenha);
  const hash = shasum.digest('hex');

  try {
    await prisma.config.update({
      where: { id: parseInt(userId) },
      data: { 
        senha: hash, 
        trocar_senha: 0 // <--- Marca que já trocou
      }
    });

    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar senha." };
  }
}