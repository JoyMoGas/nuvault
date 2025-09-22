import { theme } from '@/constants/theme';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  AddIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BankIcon,
  BellIcon,
  BillIcon,
  BrowserIcon,
  BuildIcon,
  CheckEmailIcon,
  CheckIcon,
  CloseIcon,
  cloudIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  EducationIcon,
  EmailIcon,
  ErrorIcon,
  FavoriteIcon,
  FullEditIcon,
  GamingIcon,
  GenerateIcon,
  GoodIcon,
  HealthIcon,
  HelpIcon,
  HideIcon,
  HomeIcon,
  KeyIcon,
  LockIcon,
  LogOutIcon,
  MediaIcon,
  MobileIcon,
  ModerateIcon,
  NamesIcon,
  NewsIcon,
  OtherIcon,
  PhoneIcon,
  PlaneIcon,
  RegenerateIcon,
  ResetIcon,
  SearchIcon,
  secretIcon,
  SecurityIcon,
  serviceIcon,
  SettingsIcon,
  ShoppingIcon,
  ShowIcon,
  SocialMediaIcon,
  StrongIcon,
  ToolsIcon,
  UserIcon,
  VerifiedIcon,
  VeryStrongIcon,
  WeakIcon,
  wifiIcon,
  WorkIcon,
  WorkingIcon,
} from './Icons';

export const icons = {
  add: AddIcon,
  key: KeyIcon,
  generate: GenerateIcon,
  copy: CopyIcon,
  favorite: FavoriteIcon,
  show: ShowIcon,
  hide: HideIcon,
  search: SearchIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  correct: CheckIcon,
  settings: SettingsIcon,
  verified: VerifiedIcon,
  browser: BrowserIcon,
  regenerate: RegenerateIcon,
  mobile: MobileIcon,
  socialMedia: SocialMediaIcon,
  email: EmailIcon,
  bank: BankIcon,
  work: WorkIcon,
  shopping: ShoppingIcon,
  gaming: GamingIcon,
  media: MediaIcon,
  bill: BillIcon,
  education: EducationIcon,
  other: OtherIcon,
  error: ErrorIcon,
  working: WorkingIcon,
  checkEmail: CheckEmailIcon,
  veryStrong: VeryStrongIcon,
  strong: StrongIcon,
  good: GoodIcon,
  moderate: ModerateIcon,
  weak: WeakIcon,
  health: HealthIcon,
  reset: ResetIcon,
  user: UserIcon,
  names: NamesIcon,
  phone: PhoneIcon,
  security: SecurityIcon,
  arrowLeft: ArrowLeftIcon,
  lock: LockIcon,
  service: serviceIcon,
  cloud: cloudIcon,
  wifi: wifiIcon,
  build: BuildIcon,
  airplane: PlaneIcon,
  news: NewsIcon,
  tools: ToolsIcon,
  home: HomeIcon,
  logOut: LogOutIcon,
  help: HelpIcon,
  arrowDown: ArrowDownIcon,
  close: CloseIcon,
  secret: secretIcon,
  bell: BellIcon,
  fullEdit: FullEditIcon,
  arrowRight: ArrowRightIcon,
  
} as const;

export type IconName = keyof typeof icons;


interface IconProps { // No necesita extender React.SVGProps para React Native
  name: IconName;
  size?: number;
  color?: string;
  [key: string]: any; // Para otras props como 'style'
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color, ...props }) => {
  const IconComponent = icons[name];

  // ✅ VERIFICACIÓN DE SEGURIDAD AÑADIDA
  if (!IconComponent) {
    // Si el nombre del ícono no se encuentra, muestra un aviso en la consola
    // y renderiza un ícono de "pregunta" para que no quede un espacio vacío.
    console.warn(`[Icon] El ícono con el nombre "${name}" no fue encontrado en tu lista.`);
    return <FontAwesome name="question-circle" size={size} color="red" {...props} />;
  }

  // Si se encuentra, lo renderiza normalmente.
  return <IconComponent size={size} color={color || theme.colors.darkGray} {...props} />;
};

export default Icon;
