'use client'

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function WhatsAppSender({ lojaNome, lojaUrl }: { lojaNome: string, lojaUrl: string }) {
  const [telefone, setTelefone] = useState('');

  const enviarMensagem = () => {
    // Limpa caracteres não numéricos
    const numLimpo = telefone.replace(/\D/g, '');

    if (numLimpo.length < 10) {
      toast.error('Digite um número válido com DDD');
      return;
    }

    // Monta a mensagem igual ao seu PHP antigo
    const msg = `🙋‍♀️ 😍 *${lojaNome}* 😱 😎\n\n` +
                `Click no link abaixo 👇 para você acessar e fazer seu pedido com mais agilidade.\n\n` +
                `🍱 ${window.location.origin}/loja/${lojaUrl}\n\n` +
                `Estamos aguardando o seu pedido.\n` +
                `🍟 🍔 🍕 🥟 🍧 🍽`;

    const textoCodificado = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=55${numLimpo}&text=${textoCodificado}`, '_blank');
  };

  return (
    <div className="row align-items-center">
      <div className="col-md-4">
        <div className="form-group mg-b-0">
          <label>Número do Cliente (DDD + Número)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ex: 11999999999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            maxLength={11}
          />
        </div>
      </div>
      <div className="col-md-5">
        <div className="form-group mg-b-0">
          <label className="d-none d-md-block">&nbsp;</label>
          <button className="btn btn-success btn-block" onClick={enviarMensagem}>
            Enviar no WhatsApp <i className="fa fa-arrow-right mg-l-5"></i>
          </button>
        </div>
      </div>
    </div>
  );
}