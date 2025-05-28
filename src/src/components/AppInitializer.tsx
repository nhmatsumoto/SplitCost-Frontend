import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useResidences } from '../hooks/useResidences';
import { useResidenceStore } from '../store/residenceStore';

const AppInitializer = () => {
    const { isAuthenticated, user } = useAuth();
    const { getByUserId } = useResidences();

    const {setResidence, residence} = useResidenceStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            

            // verificar o que está acontecendo com o residence que está fazendo multiplos requests periodicamente 
            if(!residence){
                const residenceData =  getByUserId(user.profile.sub);
                try {
                    residenceData.then((res) => {
                        if (res) {
                            setResidence(res);
                        }
                    });
                } catch (error) {
                    console.error("Error fetching residence data:", error);
                }
            }
        } else if (!isAuthenticated) {
            // Limpar o estado da residência se o usuário não estiver autenticado
            setResidence(null);
        }
    }, [isAuthenticated]);

    return null; 
};

export default AppInitializer;