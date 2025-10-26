export const httpErrorMessages: Record<string, string> = {
  // --- Erros do lado do Cliente ---
  '408': 'O tempo de espera pela resposta do servidor expirou. Tente novamente.',
  '409': 'Ocorreu um conflito. A ação não pode ser concluída, verifique os dados.',
  '410': 'O recurso que você tentou acessar não existe mais.',
  '413': 'O arquivo ou dado que você tentou enviar é muito grande. Por favor, envie algo menor.',
  '415': 'O tipo de arquivo enviado não é suportado.',
  '422': 'Os dados enviados são inválidos e não puderam ser processados.',
  '429': 'Você fez muitas requisições em um curto período. Tente novamente mais tarde.',

  // --- Erros do lado do Servidor
  '500': 'Ocorreu um erro inesperado no servidor. Nossa equipe já foi notificada.',
  '501': 'A funcionalidade que você tentou usar ainda não foi implementada.',
  '502': 'O servidor está com dificuldades para se comunicar com outro serviço. Aguarde um instante e tente novamente.',
  '503': 'O serviço está temporariamente indisponível. Em breve estará de volta.',
  '504': 'O servidor demorou muito para responder. Por favor, tente novamente mais tarde.',

  // --- (Fallback) ---
  'default': 'Algo deu errado. Verifique sua conexão e tente novamente.'
};
