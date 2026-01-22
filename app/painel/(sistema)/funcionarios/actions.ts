'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Função auxiliar para pegar o ID da empresa logada (ajuste conforme sua autenticação atual)
async function getEmpresaId() {
  // Supondo que você use um cookie 'painel_session' ou similar
  // Se ainda não tiver login de painel robusto, vamos pegar fixo ou do cookie existente
  // Por enquanto, vamos assumir que o IDU vem de algum lugar ou você passa fixo.
  // Vou deixar genérico para buscarmos pelo usuário admin.
  
  // IMPORTANTE: Ajuste aqui para pegar o ID real do dono logado no painel
  return 2; // <--- TROQUE ISSO PELO ID DA SUA SESSÃO QUANDO TIVERMOS O LOGIN DO PAINEL PRONTO
}

export async function getFuncionarios() {
  const idu = await getEmpresaId(); // Pega o ID da loja
  return await prisma.funcionario.findMany({
    where: { idu },
    orderBy: { nome: 'asc' }
  });
}

export async function salvarFuncionario(formData: FormData) {
  const idu = await getEmpresaId();
  const id = formData.get('id');
  const nome = formData.get('nome') as string;
  const login = formData.get('login') as string;
  const senha = formData.get('senha') as string;
  const funcao = formData.get('funcao') as string;

  try {
    // Verifica se o login já existe (para evitar duplicidade na mesma loja)
    const existente = await prisma.funcionario.findFirst({
      where: { 
        idu, 
        login,
        // Se for edição, exclui o próprio ID da busca
        NOT: id ? { id: Number(id) } : undefined
      }
    });

    if (existente) {
      return { error: "Este login já está em uso por outro funcionário." };
    }

    const dados: any = {
      idu,
      nome,
      login,
      funcao
    };

    // Só atualiza a senha se ela foi preenchida (no caso de edição) ou se é novo
    if (senha && senha.trim() !== '') {
      const hash = await bcrypt.hash(senha, 10);
      dados.senha = hash;
    }

    if (id) {
      // ATUALIZAR
      await prisma.funcionario.update({
        where: { id: Number(id) },
        data: dados
      });
    } else {
      // CRIAR NOVO
      if (!senha) return { error: "A senha é obrigatória para novos funcionários." };
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

export async function excluirFuncionario(id: number) {
  try {
    await prisma.funcionario.delete({ where: { id } });
    revalidatePath('/painel/funcionarios');
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir." };
  }
}