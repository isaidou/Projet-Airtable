import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetTechnologies = () => {
    const { setGlobalLoading } = useGlobal()
    const [technologies, setTechnologies] = useState([])
    const [loading, setLoading] = useState(true)

    const getTechnologies = () => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('technology')
            .then(setTechnologies)
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }

    useEffect(() => {
        getTechnologies()
    }, [])

    return { technologies, getTechnologies, loading }
}