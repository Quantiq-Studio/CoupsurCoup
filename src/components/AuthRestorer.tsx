import { useAuthRestore } from '@/hooks/useAuthRestore';

const AuthRestorer = () => {
    useAuthRestore();
    return null;
};

export default AuthRestorer;