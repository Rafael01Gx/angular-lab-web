export const API_ROUTES = {
  AUTH: {
    BASE: 'auth',
    POST: {
      LOGIN: 'login',
      REGISTER: 'register',
      LOGOUT: 'logout',
    },
    GET: {
      PROFILE: 'profile',
    },
  },

  AMOSTRAS: {
    BASE: 'amostra',
    GET: {
      FIND_ALL: '', // ?Query
      FIND_ALL_WITH_USERS: 'amostras',
      FIND_ALL_WITH_USERS_ADMIN: 'completas',
      FIND_ALL_BY_USER: 'user', // ?Query
      GET_AGENDAMENTO_SEMANAL: 'agenda-semanal',
      GET_ESTATISTICAS: 'estatisticas',
      FIND_ALL_WITH_USERS_BY_OS: 'ordens-de-servico/', // Param :numeroOs
      DETALHES_AMOSTRA: 'detalhes/', // Param :id'
      FIND_BY_ID: '', // Param :id
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      ASSINAR: 'assinar/',// Param :id',
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  AMOSTRAS_LAB_EXTERNO: {
    BASE: 'amostra-lab-externo',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  AMOSTRAS_ANALISE_EXTERNA: {
    BASE: 'amostra-analise-externa',
    GET: {
      FIND_ALL: '',
      FIND_ALL_ALCALIS_ZINCO:'alcaliszinco',
      DASHBOARD_COMPLETO: 'dashboard',
      FIND_ALL_WITH_RESULTS:'resultados'
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
      UPDATE_MANY: '',
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  CONFIG_ANALISES: {
    BASE: 'config-analise',
    GET: {
      FIND_ALL: '',
      FIND_BY_TIPO_ANALISE_ID: 'analise/', // Param :id
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  ELEMENTO_QUIMICO: {
    BASE: 'elemento-quimico',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  LABORATORIO_EXTERNO: {
    BASE: 'laboratorio-externo',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  MATERIAS_PRIMAS: {
    BASE: 'materia-prima',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  NOTIFICACOES: {
    BASE: 'notificacoes',
    GET: {
      GET_MY_NOTIFICATIONS: 'all',
      GET_UNREAD_COUNT: 'unread/count',
      GET_ALL_NOTIFICATIONS_ADMIN: 'admin/all',
      GET_NOTIFICATION_STATS_ADMIN: 'admin/stats',
      GET_NOTIFICATION_BY_ID:  '', // Param :id
    },
    POST: {
      NOTIFY_ALL_ADMINS: 'admin/broadcast',
      NOTIFY_USER_ADMIN: 'admin/user',
      NOTIFY_MULTIPLE_USERS_ADMIN: 'admin/users',
      NOTIFY_ALL_USERS_ADMIN: 'admin/broadcast-all',
    },
    PATCH: {
      MARK_ALL_AS_READ: 'read-all',
      MARK_AS_READ: 'read/', // Param :id
    },
    DELETE: {
      CLEAR_READ_NOTIFICATIONS: 'clear-read',
      DELETE_NOTIFICATION: '', // Param :id
    },
  },

  ORDENS_DE_SERVICO: {
    BASE: 'ordem-servico',
    POST: {
      CREATE: '',
    },
    GET: {
      FIND_ALL: '', // ?Query
      FIND_BY_FILTERS: 'filter',
      FIND_BY_USER_AND_FILTERS: 'all',
      FIND_ALL_BY_USER: 'user',  // ?Query
      GET_ESTATISTICAS: 'estatisticas',
    },
    PATCH: {
      AGENDAR: 'agendar/', // Param :id
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  PARAMETROS_ANALISES: {
    BASE: 'parametro-analise',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  REMESSA_LAB_EXTERNO: {
    BASE: 'remessa-lab-externo',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  TIPOS_DE_ANALISES: {
    BASE: 'tipo-de-analise',
    GET: {
      FIND_ALL: '',
    },
    POST: {
      CREATE: '',
    },
    PATCH: {
      UPDATE: '', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

  USER: {
    BASE: 'user',
    GET: {
      GET_ALL: '',
      GET_BY_ID: '', // Param :id
    },
    POST: {
      FORGOT_PASSWORD: 'forgot-password',
      RESET_PASSWORD: 'reset-password',
    },
    PATCH: {
      UPDATE: '', // Param :id
      UPDATE_STATUS: 'status/', // Param :id
    },
    DELETE: {
      DELETE: '', // Param :id
    },
  },

    UPLOAD: {
    BASE: 'upload',
    GET: {
      GET_ALL: '',
      GET_BY_ID: '',
    },
    POST: {
      UPLOAD_RESULTADO: 'analise',

    },
    PATCH: {
      UPDATE: '',
      UPDATE_STATUS: '',
    },
    DELETE: {
      DELETE: '',
    },
  },
};





