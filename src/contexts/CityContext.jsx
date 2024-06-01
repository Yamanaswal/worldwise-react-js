const {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback } = require("react");

const CityContext = createContext();

const BASE_URL = "https://fake-api-vercel-rosy.vercel.app";

const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "loading":
            return { ...state, isLoading: true };

        case "cities/loaded":
            return {
                ...state,
                isLoading: false,
                cities: action.payload,
            };

        case "city/loaded":
            return { ...state, isLoading: false, currentCity: action.payload };

        case "city/created":

            return {
                ...state,
                isLoading: false,
                cities: [...state.cities, action.payload],
                currentCity: action.payload,
            };


        case "city/deleted":
            return {
                ...state,
                isLoading: false,
                cities: state.cities.filter((city) => city.id !== action.payload),
                currentCity: {},
            };

        case "rejected":
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        default:
            throw new Error("Unknown action type");
    }
}


function CityProvider({ children }) {

    const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
        reducer,
        initialState
    );

    useEffect(function () {
        async function fetchCities() {
            dispatch({ type: "loading" });

            try {
                const res = await fetch(`${BASE_URL}/cities`);
                const data = await res.json();
                dispatch({ type: "cities/loaded", payload: data });
            } catch {
                dispatch({
                    type: "rejected",
                    payload: "There was an error loading cities...",
                });
            }
        }
        fetchCities();
    }, []);


    const getCity = useCallback(
        async function getCity(id) {
            if (Number(id) === currentCity.id) {
                return;
            }

            dispatch({ type: "loading" });

            try {
                const res = await fetch(`${BASE_URL}/cities/${id}`);
                const data = await res.json();
                dispatch({ type: "city/loaded", payload: data });
            } catch {
                dispatch({
                    type: "rejected",
                    payload: "There was an error loading the city...",
                });
            }

        },
        [currentCity.id]
    );


    async function createCity(newCity) {
        dispatch({ type: "loading" });

        console.log(JSON.stringify(newCity));

        try {
            const res = await fetch(`${BASE_URL}/cities`, {
                method: "POST",
                body: JSON.stringify(newCity),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            dispatch({ type: "city/created", payload: data });
        } catch {
            dispatch({
                type: "rejected",
                payload: "There was an error creating the city...",
            });
        }
    }

    async function deleteCity(id) {
        dispatch({ type: "loading" });

        try {
            await fetch(`${BASE_URL}/cities/${id}`, {
                method: "DELETE",
            });

            dispatch({ type: "city/deleted", payload: id });
        } catch {
            dispatch({
                type: "rejected",
                payload: "There was an error deleting the city...",
            });
        }
    }


    return (
        <CityContext.Provider value={
            {
                cities: cities,
                isLoading: isLoading,
                currentCity: currentCity,
                getCity: getCity,
                error: error,
                createCity: createCity,
                deleteCity: deleteCity
            }
        }>
            {children}
        </CityContext.Provider>
    );
}


function useCity() {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error("CityContext (useCity) is used Outside of CityProvider ....");
    }
    return context;
}



export { CityProvider, useCity };