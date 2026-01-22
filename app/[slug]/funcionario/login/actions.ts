'use server'

import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginFuncionarioAction(formData: FormData) {
  const slug = formData.get('slug') as string;
  const login = formData.get('login') as string;
  const senha = formData.get('senha') as string;
  const callbackUrl = formData.get('callbackUrl') as string;
  const mesaId = formData.get('mesaId') as string;

  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  if (!empresa) return { error: "Empresa não encontrada" };

  const funcionario = await prisma.funcionario.findFirst({
    where: { idu: empresa.id, login: login }
  });

  if (!funcionario || !funcionario.senha) {
    return { error: "Login ou senha incorretos." };
  }

  const senhaValida = await bcrypt.compare(senha, funcionario.senha);

  if (!senhaValida) {
    return { error: "Login ou senha incorretos." };
  }

  const agora = new Date();
  const alvoExpiracao = new Date(agora);
  alvoExpiracao.setHours(6, 0, 0, 0);
  if (agora > alvoExpiracao) {
    alvoExpiracao.setDate(alvoExpiracao.getDate() + 1);
  }
  const msAteExpirar = alvoExpiracao.getTime() - agora.getTime();

  // --- DEFINIÇÃO DO COOKIE ---
  const cookieStore = cookies();
  let cookieName = `staff_session_${slug}`; // Nome padrão (Global)

  if (mesaId) {
    // Se for login na mesa, o nome é específico
    cookieName = `staff_session_${slug}_${mesaId}`;
    
    // LIMPEZA: Remove o cookie global antigo para evitar conflitos
    cookieStore.delete(`staff_session_${slug}`);
  }

  cookieStore.set(cookieName, JSON.stringify({
    id: funcionario.id,
    nome: funcionario.nome,
    funcao: funcionario.funcao,
    mesaVinculada: mesaId || 'GERAL'
  }), {
    maxAge: msAteExpirar / 1000, 
    path: '/',
    httpOnly: true
  });

  if (callbackUrl && callbackUrl.includes(slug)) {
    redirect(callbackUrl);
  } else {
    if (funcionario.funcao === 'GERENTE' && !mesaId) {
        redirect('/painel/dashboard');
    }
    return { success: true, message: "Acesso liberado!" };
  }
}