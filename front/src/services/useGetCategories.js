import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetCategories = () => {
    const { setGlobalLoading } = useGlobal()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const getCategories = () => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('category')
            .then(setCategories)
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }

    useEffect(() => {
        getCategories()
    }, [])

    return { categories, getCategories, loading }
}