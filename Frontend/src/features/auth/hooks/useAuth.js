import { useDispatch } from "react-redux";
import { register, login, getMe } from "../services/auth.api";
import { setUser, setLoading, setError, clearError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await register({ email, username, password });
            return { success: true, data };
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"));
            return { success: false };
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return { success: true, data };
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Login failed"));
            return { success: false };
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const data = await getMe();
            dispatch(setUser(data.user));
            return { success: true, data };
        } catch {
            dispatch(setUser(null));
            dispatch(setError(null));
            return { success: false };
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    };
}
