import { useEffect, useState, useCallback } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetCategories = () => {
    const { setGlobalLoading } = useGlobal()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const getCategories = useCallback(() => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('category')
            .then(setCategories)
            .catch((error) => {
                console.error('Erreur lors de la récupération des catégories:', error);
                setCategories([]);
            })
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }, [setGlobalLoading])

    useEffect(() => {
        getCategories()
    }, [getCategories])

    return { categories, getCategories, loading }
}