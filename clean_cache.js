import fs from 'fs';
import path from 'path';

const paths = [
  path.join(process.cwd(), 'node_modules', '.vite'),
  path.join(process.cwd(), 'node_modules')
];

console.log('Iniciando limpeza de cache...');

paths.forEach(p => {
  if (fs.existsSync(p)) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`Removido: ${p}`);
    } catch (e) {
      console.error(`Erro ao remover ${p}:`, e.message);
    }
  } else {
    console.log(`Caminho não encontrado (já limpo): ${p}`);
  }
});

console.log('Limpeza concluída.');
