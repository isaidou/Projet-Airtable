import { useState, useEffect, useRef } from "react";
import { Button } from "../components/Button";
import ProjectModal from "../components/ProjectModal";
import { useGetProjects } from "../services/useGetProjects";
import { postJson, putJson } from "../services/fetch.services";
import { useAuth } from "../contexts/AuthContext";
import ProjectCard from "../components/ProjectCard";
import { useGetCategories } from "../services/useGetCategories";
import { useGetTechnologies } from "../services/useGetTechnologies";
import { useNotification } from "../contexts/NotificationContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import Modal from "../components/Modal";

export const Projects = () => {
    const { projects, getProjects } = useGetProjects();
    const { userId, isAdmin, isAuthenticated } = useAuth();
    const { categories } = useGetCategories();
    const { technologies } = useGetTechnologies();
    const { showNotification } = useNotification();
    const location = useLocation();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTechnology, setSelectedTechnology] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortButtonRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchQuery(search);
        }
    }, [location]);

    const sortProjects = (projectsList) => {
        const sorted = [...projectsList];
        
        switch (sortBy) {
            case "popular":
                return sorted.sort((a, b) => {
                    const likesA = Array.isArray(a.likes) ? a.likes.length : 0;
                    const likesB = Array.isArray(b.likes) ? b.likes.length : 0;
                    return likesB - likesA;
                });
            case "newest":
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.creation_date || 0);
                    const dateB = new Date(b.creation_date || 0);
                    return dateB - dateA;
                });
            case "oldest":
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.creation_date || 0);
                    const dateB = new Date(b.creation_date || 0);
                    return dateA - dateB;
                });
            default:
                return sorted;
        }
    };

    const filteredProjects = sortProjects(
        projects.filter(project => {
            const matchesSearch = !searchQuery || 
            Object.values(project).some(value =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesTechnology = selectedTechnology === "all" || 
                (Array.isArray(project.technologies) 
                    ? project.technologies.includes(selectedTechnology)
                    : project.technologies === selectedTechnology);

            const matchesStatus = isAdmin || project.publishing_status === "publié";
            
            return matchesSearch && matchesTechnology && matchesStatus;
        })
    );

    const handleLike = (id) => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        if (id && !isAdmin && userId) {
            putJson('project/like', { id, user: userId })
                .then(() => {
                    getProjects();
                })
                .catch(err => {
                    const errorMessage = err.message || err.error || 'Erreur lors du like';
                    showNotification(errorMessage, 'error');
                });
        }
    };

    const handlePublishingStatus = (id, publishing_status) => {
        if (id && isAdmin) {
            putJson('project/publishing_status', { id, publishing_status })
                .then(() => {
                    getProjects();
                    showNotification(`Projet ${publishing_status === 'publié' ? 'publié' : 'caché'} avec succès !`, 'success');
                })
                .catch(err => {
                    const errorMessage = err.message || err.error || 'Erreur lors du changement d\'état';
                    showNotification(errorMessage, 'error');
                });
        }
    };

    const handleComment = (id, comment) => {
        postJson('comment', {
            comment,
            project: id,
            user: userId
        }).finally(() => getProjects())
    }

    const handleClose = () => {
        setIsOpen(false);
        setProject(null);
    };

    const sortOptions = [
        { value: "popular", label: "Populaires" },
        { value: "newest", label: "Nouveaux" },
        { value: "oldest", label: "Anciens" },
    ];

    return (
        <div className="min-h-screen bg-white">
            <ProjectModal isOpen={isOpen} onClose={handleClose} onSuccess={getProjects} project={project} />
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Authentification requise"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => setShowAuthModal(false)}
                            color="outline"
                        />
                        <Button
                            label="S'inscrire"
                            onClick={() => {
                                setShowAuthModal(false);
                                navigate('/register');
                            }}
                        />
                        <Button
                            label="Se connecter"
                            onClick={() => {
                                setShowAuthModal(false);
                                navigate('/login');
                            }}
                            color="secondary"
                        />
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-slate-700">
                        Veuillez vous inscrire ou vous connecter pour interagir avec les projets (liker, commenter, etc.).
                    </p>
                </div>
            </Modal>
            
            <div className="text-center py-6 px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Portfolio des étudiants
                </h1>
                <p className="text-base text-slate-600">
                    Découvrez les projets et réalisations des étudiants
                </p>
            </div>

            <div className="bg-white sticky top-16 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1 overflow-x-auto py-2.5">
                        <div className="relative flex-shrink-0">
                            <button
                                ref={sortButtonRef}
                                onClick={() => {
                                    if (sortButtonRef.current) {
                                        const rect = sortButtonRef.current.getBoundingClientRect();
                                        setDropdownPosition({
                                            top: rect.bottom + window.scrollY + 4,
                                            left: rect.left + window.scrollX
                                        });
                                    }
                                    setShowSortDropdown(!showSortDropdown);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap"
                            >
                                {sortOptions.find(opt => opt.value === sortBy)?.label || "Populaires"}
                                <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSortDropdown && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[49]" 
                                        onClick={() => setShowSortDropdown(false)}
                                    />
                                    <div 
                                        className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[50] min-w-[160px]"
                                        style={{
                                            top: `${dropdownPosition.top}px`,
                                            left: `${dropdownPosition.left}px`
                                        }}
                                    >
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                    sortBy === option.value ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-1 flex-1 overflow-x-auto ml-1">
                            <button
                                onClick={() => setSelectedTechnology("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                    selectedTechnology === "all"
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                Tous
                            </button>
                            {technologies.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => setSelectedTechnology(tech.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedTechnology === tech.id
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {tech.name}
                                </button>
                            ))}
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setProject(null);
                                    setIsOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors flex-shrink-0 whitespace-nowrap"
                            >
                                <Plus size={16} />
                                Ajouter un projet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-16 pt-4">
                {filteredProjects.length > 0 ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                        {filteredProjects.map((proj, index) => {
                            const hasAlreadyLiked = proj?.likes?.includes(userId);
                            const published = proj.publishing_status !== "caché";
                    return (
                                <div key={index} className="break-inside-avoid mb-6">
                        <ProjectCard
                                        project={proj}
                            onClick={() => {
                                            setProject(proj);
                                            setIsOpen(true);
                            }}
                                        onLike={() => handleLike(proj.id)}
                                        onPublish={() => handlePublishingStatus(proj.id, published ? "caché" : "publié")}
                            onComment={handleComment}
                            hasAlreadyLiked={hasAlreadyLiked}
                            published={published}
                        />
                                </div>
                    );
                })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">Aucun projet trouvé</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-4 text-sm text-slate-600 hover:text-slate-900 underline"
                            >
                                Effacer la recherche
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
