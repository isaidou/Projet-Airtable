import { useEffect, useState, useCallback } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetProjects = () => {
    const { setGlobalLoading } = useGlobal()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    
    const getProjects = useCallback(() => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('project')
            .then(setProjects)
            .catch((error) => {
                console.error('Erreur lors de la récupération des projets:', error);
                setProjects([]);
            })
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }, [setGlobalLoading])

    useEffect(() => {
        getProjects()
    }, [getProjects])

    return { projects, getProjects, loading }
}