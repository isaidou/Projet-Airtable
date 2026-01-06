import { useEffect, useState, useCallback } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetTechnologies = () => {
    const { setGlobalLoading } = useGlobal()
    const [technologies, setTechnologies] = useState([])
    const [loading, setLoading] = useState(true)

    const getTechnologies = useCallback(() => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('technology')
            .then(setTechnologies)
            .catch((error) => {
                console.error('Erreur lors de la récupération des technologies:', error);
                setTechnologies([]);
            })
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }, [setGlobalLoading])

    useEffect(() => {
        getTechnologies()
    }, [getTechnologies])

    return { technologies, getTechnologies, loading }
}