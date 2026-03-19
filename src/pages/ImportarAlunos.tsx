import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Upload, FileJson, CheckCircle2, AlertTriangle, X, Download } from 'lucide-react';

interface AlunoJSON {
  nome: string;
  turma: string;
}

const exemploJSON: AlunoJSON[] = [
  { nome: 'João da Silva', turma: '5A' },
  { nome: 'Maria Oliveira', turma: '5A' },
  { nome: 'Pedro Santos', turma: '7B' },
];

export default function ImportarAlunos() {
  const { importClientes } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<AlunoJSON[]>([]);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<{ inseridos: number; duplicados: number } | null>(null);
  const [importando, setImportando] = useState(false);
  const [fileName, setFileName] = useState('');

  const validarJSON = (data: unknown): AlunoJSON[] => {
    if (!Array.isArray(data)) {
      throw new Error('O arquivo deve conter um array JSON (lista de alunos).');
    }
    if (data.length === 0) {
      throw new Error('O array está vazio. Adicione pelo menos um aluno.');
    }
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.nome || typeof item.nome !== 'string' || item.nome.trim() === '') {
        throw new Error(`Item ${i + 1}: campo "nome" é obrigatório.`);
      }
      if (!item.turma || typeof item.turma !== 'string' || item.turma.trim() === '') {
        throw new Error(`Item ${i + 1}: campo "turma" é obrigatório.`);
      }
    }
    return data.map((item: any) => ({
      nome: item.nome.trim(),
      turma: item.turma.trim(),
    }));
  };

  const handleFile = (file: File) => {
    setErro('');
    setResultado(null);
    setPreview([]);
    setFileName(file.name);

    if (!file.name.endsWith('.json')) {
      setErro('Por favor, selecione um arquivo .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const alunos = validarJSON(parsed);
        setPreview(alunos);
      } catch (err: any) {
        if (err instanceof SyntaxError) {
          setErro('JSON inválido. Verifique a formatação do arquivo.');
        } else {
          setErro(err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImportar = async () => {
    if (preview.length === 0) return;
    setImportando(true);
    setErro('');
    try {
      const res = await importClientes(preview.map(a => ({
        nome: a.nome,
        turma: a.turma,
        telefone: '',
        documento: '',
      })));
      setResultado(res);
      setPreview([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setErro('Erro ao importar. Tente novamente.');
    } finally {
      setImportando(false);
    }
  };

  const handleBaixarExemplo = () => {
    const blob = new Blob([JSON.stringify(exemploJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo-alunos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const limpar = () => {
    setPreview([]);
    setErro('');
    setResultado(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 text-violet-600 rounded-lg shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 truncate">Importar Alunos</h1>
          </div>
          <p className="text-slate-500">Faça upload de um arquivo JSON para cadastrar alunos em massa.</p>
        </div>
        <button
          onClick={handleBaixarExemplo}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Baixar Exemplo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Formato do JSON</h3>
        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">
{`[
  { "nome": "João da Silva", "turma": "5A" },
  { "nome": "Maria Oliveira", "turma": "7B" }
]`}
        </pre>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 hover:border-violet-400 transition-colors p-12 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <FileJson className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-700 mb-1">
          {fileName || 'Arraste o arquivo JSON aqui ou clique para selecionar'}
        </p>
        <p className="text-sm text-slate-400">Apenas arquivos .json</p>
      </div>

      {erro && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Erro na validação</p>
            <p className="text-sm mt-1">{erro}</p>
          </div>
          <button onClick={() => setErro('')} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {resultado && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Importação concluída!</p>
            <p className="text-sm mt-1">
              {resultado.inseridos} aluno(s) importado(s) com sucesso.
              {resultado.duplicados > 0 && ` ${resultado.duplicados} duplicado(s) ignorado(s).`}
            </p>
          </div>
          <button onClick={() => setResultado(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-800">Preview da Importação</h3>
              <p className="text-sm text-slate-500 mt-0.5">{preview.length} aluno(s) no arquivo</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={limpar}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportar}
                disabled={importando}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-medium transition-all shadow-sm shadow-violet-200 text-sm"
              >
                <Upload className="w-4 h-4" />
                {importando ? 'Importando...' : `Importar ${preview.length} Aluno(s)`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold w-12">#</th>
                  <th className="px-6 py-3 font-semibold">Nome</th>
                  <th className="px-6 py-3 font-semibold">Turma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((aluno, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 text-sm">{i + 1}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{aluno.nome}</td>
                    <td className="px-6 py-3 text-slate-600">{aluno.turma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
