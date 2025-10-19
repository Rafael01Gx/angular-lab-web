import { EMenuRoles, IMenuItem } from "../interfaces/layout.interface";

export const menuItems: IMenuItem[] = [
    {
      id: 'Info',
      label: 'Info',
      icon: 'heroInformationCircle',
      route: '/',
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'orders',
      label: 'Ordens de Serviço',
      icon: 'heroClipboardDocumentList',
      expanded: false,
      children: [
        { id: 'orders-create', label: 'Criar', icon: 'heroPlus', route: '/orders/create' },
        { id: 'orders-pending', label: 'Pendentes', icon: 'heroClock', route: '/orders/pending' },
        { id: 'orders-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/orders/completed' },
      ],
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.ADMIN],
    },
    {
      id: 'samples',
      label: 'Amostras',
      icon: 'heroBeaker',
      route: '/samples',
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.ADMIN],
    },
    {
      id: 'analysis',
      label: 'Análises',
      icon: 'heroBriefcase',
      expanded: false,
      children: [
        { id: 'analysis-waiting-auth', label: 'Aguardando autorização', icon: 'heroExclamationTriangle', route: '/analysis/waiting-authorization' },
        { id: 'analysis-waiting', label: 'Aguardando Análise', icon: 'heroClock', route: '/analysis/waiting-analysis' },
        { id: 'analysis-progress', label: 'Em andamento', icon: 'heroPlay', route: '/analysis/in-progress' },
        { id: 'analysis-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/analysis/completed' }
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'manage-orders',
      label: 'Gerenciar OS',
      icon: 'heroAdjustmentsHorizontal',
      expanded: false,
      children: [
        { id: 'manage-dashboard', label: 'Dashboard', icon: 'heroPresentationChartBar', route: '/manage-orders/dashboard' },
        { id: 'manage-waiting', label: 'Aguardando', icon: 'heroClock', route: '/manage-orders/waiting' },
       // { id: 'manage-authorized', label: 'Autorizada', icon: 'heroCheckCircle', route: '/manage-orders/authorized' },
        { id: 'manage-executing', label: 'Aprovação', icon: 'heroPlay', route: '/manage-orders/executing' },
        { id: 'manage-filter', label: 'Buscar', icon: 'heroMagnifyingGlass', route: '/manage-orders/search' }
      ],
      rolesAllowed:[EMenuRoles.ADMIN],
    },
    {
      id: 'external-labs',
      label: 'Laboratórios Externos',
      icon: 'heroListBullet',
      expanded: false,
      children: [
        { id: 'remessa', label: 'Remessa', icon: 'heroArchiveBox', route: '/external-labs/remessa' },
        { id: 'amostras', label: 'Amostras', icon: 'heroSquare2Stack', route: '/external-labs/amostras' },
        { id: 'chemical-elements', label: 'Elementos Químicos', icon: 'heroBeaker', route: '/external-labs/elementos-quimicos' },
        { id: 'labs', label: 'Laboratórios', icon: 'heroGlobeAmericas', route: '/external-labs/laboratorios' },
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'access-management',
      label: 'Gerenciar Acesso',
      icon: 'heroUserGroup',
      expanded: false,
      children: [
        { id: 'access-authorize', label: 'Gerenciar Acesso', icon: 'heroCheckCircle', route: '/access-management/authorize' },
        { id: 'access-create', label: 'Cadastrar Novo Usuário', icon: 'heroUserPlus', route: '/access-management/create-user' }
      ],
      rolesAllowed:[EMenuRoles.ADMIN],
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'heroCog6Tooth',
      expanded: false,
      children: [
        { id: 'settings-analysis', label: 'Configuração de Análise', icon: 'heroBeaker', route: '/settings/analysis' },
        { id: 'settings-parameters', label: 'Parâmetros', icon: 'heroAdjustmentsHorizontal', route: '/settings/parameters' },
        { id: 'settings-materials', label: 'Matéria-prima', icon: 'heroCube', route: '/settings/materials' },
        { id: 'settings-analysis-type', label: 'Tipo de Análise', icon: 'heroTag', route: '/settings/analysis-type' }
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    }
  ];