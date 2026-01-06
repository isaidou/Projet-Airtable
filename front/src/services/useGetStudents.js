import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext"
import { getJson } from "./fetch.services"

export const useGetStudents = () => {
    const { setGlobalLoading } = useGlobal()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const getStudents = () => {
        setLoading(true)
        setGlobalLoading(true)
        getJson('user')
            .then((res) => {
                setStudents(res)
            })
            .finally(() => {
                setLoading(false)
                setGlobalLoading(false)
            })
    }

    useEffect(() => {
        getStudents()
    }, [])

    return { students, getStudents, loading }
}