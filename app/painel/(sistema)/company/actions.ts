'use server'

import { prisma } from '../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateCompanyAction(formData: FormData) {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) return { error: "Sessão inválida" };

  const id = parseInt(lojaId);

  // Helper para juntar os horários (ex: seg1, seg2, seg3, seg4 vira "08:00,12:00,14:00,18:00")
  const joinHours = (day: string) => {
    const t1 = formData.get(`${day}1`) || '00:00';
    const t2 = formData.get(`${day}2`) || '00:00';
    const t3 = formData.get(`${day}3`) || '00:00';
    const t4 = formData.get(`${day}4`) || '00:00';
    return `${t1},${t2},${t3},${t4}`;
  };

  try {
    await prisma.config.update({
      where: { id },
      data: {
        // Dados Gerais
        nomeempresa: formData.get('nome') as string,
        celular: formData.get('celular') as string, // WhatsApp
        timerdelivery: formData.get('timerdelivery') as string,
        timerbalcao: formData.get('timerbalcao') as string,
        dfree: parseFloat((formData.get('dfree') as string).replace(',', '.')) || 0,
        
        // Endereço
        cep: formData.get('cep') as string,
        rua: formData.get('rua') as string,
        numero: formData.get('numero') as string,
        bairro: formData.get('bairro') as string,
        cidade: formData.get('cidade') as string,
        uf: formData.get('uf') as string,
        complemento: formData.get('complemento') as string,

        // Horários (Salva como string separada por vírgula, igual ao legado)
        seg: joinHours('seg'),
        ter: joinHours('ter'),
        qua: joinHours('qua'),
        qui: joinHours('qui'),
        sex: joinHours('sex'),
        sab: joinHours('sab'),
        dom: joinHours('dom'),
      }
    });

    revalidatePath('/painel/company');
    return { success: true, message: "Dados atualizados com sucesso!" };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar dados." };
  }
}