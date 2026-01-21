import { prisma } from '../../../../src/lib/prisma';
import Link from 'next/link';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const config = await prisma.adm.findFirst();

  if (!config) return <div>Erro: Configuração não encontrada.</div>

  return (
    <div className="section-wrapper mg-t-20">
      <label className="section-title">
        <Link href="/admin/dashboard" className="btn btn-success btn-sm" style={{marginRight: 10}}>
           <i className="fa fa-arrow-left"></i>
        </Link>
        CONFIGURAÇÕES DO SISTEMA
      </label>
      <hr />
      
      <SettingsForm config={config} />
    </div>
  );
}