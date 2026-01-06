import { useEffect, useState, useCallback } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetStudents = () => {
    const { setGlobalLoading } = useGlobal()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const getStudents = useCallback(() => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('user')
            .then((res) => {
                setStudents(res)
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
                setStudents([]);
            })
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }, [setGlobalLoading])

    useEffect(() => {
        getStudents()
    }, [getStudents])

    return { students, getStudents, loading }
}