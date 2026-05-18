import { GoogleLogin } from '@react-oauth/google';
import styles from './GoogleSignInButton.module.scss';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError();
          }
        }}
        onError={onError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width={380}
      />
    </div>
  );
}
