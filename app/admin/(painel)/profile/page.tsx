import { prisma } from '../../../../src/lib/prisma'; // Ajuste o caminho se necessário
import Link from 'next/link';
import ProfileForm from './ProfileForm'; // Importa o formulário interativo

export default async function ProfilePage() {
  const admin = await prisma.adm.findFirst();
  if (!admin) return <div>Erro ao carregar dados.</div>;

  return (
    <div className="section-wrapper mg-t-20">
      <label className="section-title">
         <Link href="/admin/dashboard" className="btn btn-success btn-sm" style={{marginRight: 10}}>
           <i className="fa fa-arrow-left"></i>
        </Link>
        DADOS DO ADMINISTRADOR
      </label>
      <hr />
      {/* Passamos os dados do servidor para o cliente aqui */}
      <ProfileForm data={admin} />
    </div>
  );
}