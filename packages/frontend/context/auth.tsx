import { createContext, useContext, useState, useEffect } from 'react';

import Cookies from 'js-cookie';
import api, { addBearerToken, removeBearerToken } from '../api/api';
import { routes } from '../api/routes';
import Router from 'next/router';

interface Auth {
	user: { login: string };
	setToken: ({ token: string }) => void;
	isAuthenticated: boolean;
	logout: () => void;
}

const AuthContext = createContext({} as Auth);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const token = Cookies.get('token');
		if (token) {
			setToken({ token });
		}
	}, []);

	const updateUser = async () => {
		await api
			.get(routes.me)
			.then(({ data: me }) => {
				console.log(me);
				setUser(me);
				redirectAfterLogin();
			})
			.catch(e => {
				console.error(e);
				logout();
			});
	};

	const logout = () => {
		Cookies.remove('token');
		setUser(null);
		removeBearerToken();
		redirectAfterLogout();
	};

	const setToken = async ({ token }) => {
		Cookies.set('token', token);
		addBearerToken(token);
		await updateUser();
	};

	const redirectAfterLogin = () => {
		Router.push('/dashboard');
	};
	const redirectAfterLogout = () => {
		Router.push('/');
	};

	return <AuthContext.Provider value={{ setToken, user, isAuthenticated: !!user, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const authContext = useContext(AuthContext);
	return authContext;
};
