import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import '../menu.css';
import '@/app/menu.css';

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

// 1. Gera o Título da Aba Dinamicamente (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const empresa = await prisma.config.findUnique({
    where: { url: params.slug }
  });

  if (!empresa) {
    return { title: 'Empresa não encontrada' };
  }

  return {
    title: `${empresa.nomeempresa} - Cardápio Digital`,
    description: `Faça seu pedido na ${empresa.nomeempresa}`,
    // Se quiser adicionar favicon dinâmico futuramente, é aqui
  };
}

// 2. O Layout que envolve as páginas
export default async function LojaLayout({ children, params }: Props) {
  
  // Verifica se a empresa existe apenas uma vez aqui no topo
  const empresa = await prisma.config.findUnique({
    where: { url: params.slug }
  });

  // Se a empresa não existir no banco, joga para a página 404 padrão do Next
  if (!empresa) {
    notFound(); 
  }

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Aqui poderíamos injetar CSS Variables com as cores da empresa
         para usar no Tailwind, ex: style={{ '--primary': empresa.cormenu }}
      */}
      
      {children}
      
    </section>
  );
}