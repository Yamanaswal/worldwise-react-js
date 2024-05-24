import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Map.module.css'

function Map() {

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const lat = searchParams.get("lat");
    const long = searchParams.get("long");

    return (
        <div className={styles.mapContainer} onClick={() => {
            navigate("form")
        }}>
            Map
        </div>
    )
}

export default Map