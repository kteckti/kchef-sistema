'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../../src/lib/prisma'; // Ajuste o caminho se necessário (ex: ../../src/lib/db)
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';


export async function loginAction(prevState: any, formData: FormData) {
  const login = formData.get('login') as string;
  const password = formData.get('password') as string;

  if (!login || !password) {
    return { error: "Preencha todos os campos" };
  }

  try {
    // 1. Busca o usuário pelo LOGIN primeiro (para checar bloqueio)
    const user = await prisma.adm.findFirst({
      where: { login: login }
    });

    // Se o usuário nem existe, retornamos erro genérico (segurança)
    if (!user) {
      return { error: "Usuário ou senha incorretos!" };
    }

    // 2. VERIFICA SE ESTÁ BLOQUEADO
    if (user.bloqueado_ate) {
      const agora = new Date();
      if (user.bloqueado_ate > agora) {
        const minutosRestantes = Math.ceil((user.bloqueado_ate.getTime() - agora.getTime()) / 60000);
        return { error: `Muitas tentativas. Tente novamente em ${minutosRestantes} minutos.` };
      }
    }

    // 3. Verifica a Senha
    const shasum = crypto.createHash('sha1');
    shasum.update(password);
    const senhaHash = shasum.digest('hex');

    if (user.senha === senhaHash) {
      // --- SUCESSO ---
      
      // Zera o contador de tentativas e o bloqueio
      await prisma.adm.update({
        where: { id: user.id },
        data: { tentativas: 0, bloqueado_ate: null }
      });

      // Cria o Cookie
      cookies().set('admin_session', user.id.toString(), { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/' 
      });

      return { success: true };

    } else {
      // --- SENHA INCORRETA (Lógica de Bloqueio) ---
      
      const novasTentativas = (user.tentativas || 0) + 1;
      let dataBloqueio = null;
      let mensagemErro = "Usuário ou senha incorretos!";

      // Se chegou a 5 tentativas, bloqueia por 5 minutos
      if (novasTentativas >= 5) {
        const bloqueio = new Date();
        bloqueio.setMinutes(bloqueio.getMinutes() + 5); // Adiciona 5 minutos
        dataBloqueio = bloqueio;
        mensagemErro = "Muitas tentativas erradas. Conta bloqueada por 5 minutos.";
      }

      // Atualiza o banco com a nova tentativa
      await prisma.adm.update({
        where: { id: user.id },
        data: { 
          tentativas: novasTentativas >= 5 ? 0 : novasTentativas, // Opcional: zerar ao bloquear ou manter 5
          bloqueado_ate: dataBloqueio 
        }
      });

      return { error: mensagemErro };
    }

  } catch (err) {
    console.error(err);
    return { error: "Erro interno no servidor." };
  }
}

export async function logoutAction() {
  // Destrói o cookie
  cookies().delete('admin_session');
  redirect('/admin/login');
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  // 1. PEGA O ID DO FORMULÁRIO (Converter para Int)
  const idRaw = formData.get('id') as string;
  const id = parseInt(idRaw);

  const nome = formData.get('nome') as string;
  const login = formData.get('login') as string;
  const celular = formData.get('celular') as string;
  const senha = formData.get('senha') as string;

  try {
    let dataUpdate: any = { nome, login, celular };

    if (senha && senha.length > 0) {
      const crypto = require('crypto'); // Garante que importou
      const shasum = crypto.createHash('sha1');
      shasum.update(senha);
      dataUpdate.senha = shasum.digest('hex');
    }

    // 2. USA O ID DINÂMICO NO WHERE
    await prisma.adm.update({
      where: { id: id }, // <--- AGORA ESTÁ CORRETO
      data: dataUpdate
    });

    return { success: true, message: "Perfil atualizado com sucesso!" };
  } catch (error) {
    console.error(error); // Bom para ver erros no log da Vercel
    return { success: false, message: "Erro ao atualizar perfil." };
  }
}

// --- Ação de Atualizar Configurações ---
export async function updateSettingsAction(prevState: any, formData: FormData) {
  try {
    await prisma.adm.update({
      where: { id: 1 },
      data: {
        novocliente: formData.get('novocliente') as string,
        dias: formData.get('dias') as string,
        bloquear: parseInt(formData.get('bloquear') as string),
        statuslink: parseInt(formData.get('statuslink') as string),
        nomedosite: formData.get('nomedosite') as string,
        urlsite: formData.get('urlsite') as string,
        linkpgmto: formData.get('linkpgmto') as string,
      }
    });
    return { success: true, message: "Configurações salvas com sucesso!" };
  } catch (error) {
    return { success: false, message: "Erro ao salvar configurações." };
  }
}
export async function createClientAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const celular = formData.get('celular') as string;
  const url = formData.get('url') as string;
  const cpf = formData.get('cpf') as string; // <--- Novo Campo
  const validade = formData.get('validade') as string;

  if (!nome || !url || !cpf) {
    return { error: "Nome, URL e CPF/CNPJ são obrigatórios." };
  }

  try {
    const existe = await prisma.config.findUnique({ where: { url: url } });
    if (existe) return { error: "Esta URL já está em uso." };

    // 1. GERAR SENHA ALEATÓRIA (6 caracteres)
    const senhaGerada = crypto.randomBytes(3).toString('hex'); 
    
    // 2. CRIPTOGRAFAR (SHA1) para salvar no banco
    const shasum = crypto.createHash('sha1');
    shasum.update(senhaGerada);
    const senhaHash = shasum.digest('hex');

    await prisma.config.create({
      data: {
        idu: 1,
        nomeempresa: nome,
        url: url,
        celular: celular,
        cpf: cpf,               // Salva o CPF
        senha: senhaHash,       // Salva a senha criptografada
        trocar_senha: 1,        // Força a troca no próximo login
        status: 1,
        expiracao: validade ? new Date(validade) : null,
        timerdelivery: '40-60 min',
        timerbalcao: '20 min',
        dfree: 0
      }
    });

    revalidatePath('/admin/dashboard');
    
    // RETORNA A SENHA GERADA PARA EXIBIR NA TELA
    return { 
        success: true, 
        message: "Empresa criada!", 
        tempPassword: senhaGerada 
    };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar empresa." };
  }
}

// --- 1. ATUALIZAR DADOS DA EMPRESA ---
async function uploadFile(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Gera um nome único para não substituir errados
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  
  // Caminho: public/img/{folder}/{filename}
  const uploadDir = path.join(process.cwd(), 'public', 'img', folder);
  const filePath = path.join(uploadDir, filename);

  try {
    await writeFile(filePath, buffer);
    return filename; // Retorna só o nome para salvar no banco
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    return null;
  }
}

export async function updateClientDataAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const nome = formData.get('nome') as string;
  const cpf = formData.get('cpf') as string;
  const url = formData.get('url') as string;
  const celular = formData.get('celular') as string;
  const cormenu = formData.get('cormenu') as string; // Cor Personalizada
  
  // 1. Processa Uploads
  const logoFile = formData.get('logo') as File;
  const bannerFile = formData.get('banner') as File;

  const logoName = await uploadFile(logoFile, 'logomarca');     // Salva em public/img/logomarca
  const bannerName = await uploadFile(bannerFile, 'fundo_banner'); // Salva em public/img/fundo_banner

  // 2. Monta objeto de atualização
  const dataToUpdate: any = {
    nomeempresa: nome,
    cpf: cpf,
    url: url,
    celular: celular,
    cormenu: cormenu,
  };

  // Só atualiza no banco se enviou nova imagem
  if (logoName) dataToUpdate.logo = logoName;
  if (bannerName) dataToUpdate.fundoTopo = bannerName; // No banco chama fundoTopo? Verifique seu Schema

  try {
    await prisma.config.update({
      where: { id },
      data: dataToUpdate
    });
    
    revalidatePath(`/admin/clients/${id}`);
    return { success: true, message: "Dados e Imagens atualizados!" };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar." };
  }
}

// --- 2. CORTAR ACESSO / DESBLOQUEAR ---
export async function toggleClientStatusAction(id: number, currentStatus: number) {
  try {
    // Se for 1 (Ativo), muda para 3 (Bloqueado). Se não, volta para 1.
    const newStatus = currentStatus === 1 ? 3 : 1;
    
    await prisma.config.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath(`/admin/clients/${id}`);
    revalidatePath('/admin/dashboard');
    return { success: true, message: newStatus === 3 ? "Acesso cortado!" : "Acesso liberado!" };
  } catch (error) {
    return { error: "Erro ao alterar status." };
  }
}

// --- 3. GERAR NOVA SENHA (RESET) ---
export async function resetClientPasswordAction(id: number) {
  try {
    // Gera senha de 6 digitos aleatória
    const crypto = require('crypto');
    const novaSenhaRaw = crypto.randomBytes(3).toString('hex');

    // Criptografa
    const shasum = crypto.createHash('sha1');
    shasum.update(novaSenhaRaw);
    const senhaHash = shasum.digest('hex');

    await prisma.config.update({
      where: { id },
      data: {
        senha: senhaHash,
        trocar_senha: 1 // Força o cliente a trocar no login
      }
    });

    // Retorna a senha crua para mostrar na tela pro Admin copiar
    return { success: true, newPassword: novaSenhaRaw };
  } catch (error) {
    return { error: "Erro ao resetar senha." };
  }
}