import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import TableConfigForm from './TableConfigForm';

export default async function TablesPage() {
    const session = cookies().get('painel_session')?.value;

    if (!session) {
        return <div className="pd-20 text-center">Sessão expirada. Faça login novamente.</div>;
    }

    const loja = await prisma.config.findFirst({
        where: {
            id: parseInt(session)
        }
    });

    if (!loja) {
        return (
            <div className="pd-20 text-center">
                <h3 className="tx-danger">Loja não encontrada.</h3>
                <p>ID da sessão: <strong>{session}</strong></p>
            </div>
        );
    }

    const pedidosAtivos = await prisma.pedido.findMany({
        where: {
            idu: loja.id,
            status: { in: [1, 2, 3] },
            mesa: { not: null }
        },
        select: { mesa: true }
    });

    const mesasOcupadas = Array.from(new Set(pedidosAtivos.map(p => p.mesa)));
    const totalMesas = loja.totalMesas || 10;
    const ocupadasCount = mesasOcupadas.length;
    const porcentagem = totalMesas > 0 ? Math.round((ocupadasCount / totalMesas) * 100) : 0;

    return (
        <div className="pd-y-20">
            <div className="d-flex align-items-center justify-content-between mg-b-20">
                <div>
                    <h4 className="tx-gray-800 mg-b-5">Gestão de Mesas</h4>
                    <p className="mg-b-0 text-muted">Visualize a lotação do estabelecimento em tempo real.</p>
                </div>

                <div className="text-right">
                    <TableConfigForm lojaId={loja.id} totalAtual={totalMesas} />
                </div>
            </div>

            <div className="card card-body pd-25 mg-b-25 text-center shadow-sm" style={{ borderRadius: '15px', border: 'none', backgroundColor: '#fff' }}>
                <h1 className={`mg-b-5 ${porcentagem > 80 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '54px', fontWeight: '800' }}>
                    {porcentagem}%
                </h1>
                <p className="tx-uppercase tx-13 tx-spacing-1 tx-bold mg-b-0 text-muted">
                    Lotação Atual ({ocupadasCount} de {totalMesas} mesas ocupadas)
                </p>
            </div>

            {/* Grid de Mesas Ajustado */}
            <div className="row row-xs">
                {Array.from({ length: totalMesas }, (_, i) => {
                    const numMesaOriginal = (i + 1).toString(); // "4"
                    const numMesaComZero = numMesaOriginal.padStart(2, '0'); // "04"

                    // Verifica se o ID da mesa existe no array de ocupadas em qualquer um dos formatos
                    const isOcupada = mesasOcupadas.includes(numMesaOriginal) ||
                        mesasOcupadas.includes(numMesaComZero);

                    return (
                        <div key={numMesaOriginal} className="col-6 col-sm-4 col-md-3 col-lg-2 mg-t-15">
                            <div
                                style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                                    backgroundColor: isOcupada ? '#dc3545' : '#ffffff',
                                    transition: 'all 0.4s ease',
                                    minHeight: '130px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '20px',
                                    border: isOcupada ? 'none' : '1px solid #f0f0f0'
                                }}
                            >
                                <i
                                    className="icon ion-ios-people tx-34"
                                    style={{
                                        color: isOcupada ? '#ffffff' : '#adb5bd',
                                        lineHeight: '1',
                                        opacity: 1,
                                        visibility: 'visible'
                                    }}
                                ></i>

                                <h5
                                    className="mg-t-12 mg-b-0"
                                    style={{
                                        color: isOcupada ? '#ffffff' : '#343a40',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        opacity: 1
                                    }}
                                >
                                    Mesa {numMesaComZero}
                                </h5>

                                <small
                                    style={{
                                        color: isOcupada ? '#ffffff' : '#6c757d',
                                        display: 'block',
                                        marginTop: '4px',
                                        fontWeight: '600',
                                        opacity: 1
                                    }}
                                >
                                    {isOcupada ? 'OCUPADA' : 'LIVRE'}
                                </small>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}