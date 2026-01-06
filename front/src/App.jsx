import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { GlobalProvider } from "./contexts/GlobalContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Categories } from "./pages/Categories";
import { Layout } from "./pages/Layout";
import { Projects } from "./pages/Projects";
import { Register } from "./pages/Register";
import { Students } from "./pages/Students";
import { Technologies } from "./pages/Technologies";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import { Contacts } from "./pages/Contacts";
import LoadingBar from "./components/LoadingBar";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";

function App() {
    return (
        <GlobalProvider>
            <NotificationProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Layout>
                            <LoadingBar />
                            <Routes>
                            <Route path="/">
                                <Route
                                    index
                                    element={<Projects />}
                                />
                                <Route
                                    path="register"
                                    element={<Register />}
                                />
                                <Route
                                    path="login"
                                    element={<Login />}
                                />
                                <Route
                                    path="contact"
                                    element={<Contact />}
                                />
                                <Route
                                    path="students"
                                    element={<AdminRoute element={Students} />}
                                />
                                <Route
                                    path="contacts"
                                    element={<AdminRoute element={Contacts} />}
                                />
                                <Route
                                    path="categories"
                                    element={<AdminRoute element={Categories} />}
                                />
                                <Route
                                    path="technologies"
                                    element={<AdminRoute element={Technologies} />}
                                />
                                <Route
                                    path="profile"
                                    element={<ProtectedRoute element={Profile} />}
                                />
                                <Route
                                    path="*"
                                    element={<NotFound />}
                                />
                            </Route>
                        </Routes>
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
            </NotificationProvider>
        </GlobalProvider>
    );
}

export default App;
