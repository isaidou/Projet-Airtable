import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetProjects = () => {
    const { setGlobalLoading } = useGlobal()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    
    const getProjects = () => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('project')
            .then(setProjects)
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }

    useEffect(() => {
        getProjects()
    }, [])

    return { projects, getProjects, loading }
}