import { useQuery } from "@apollo/client";
import { LOAD_RECIPES } from '../GraphqQL/Query';
import { useEffect } from "react";

const GetRecipe = () => {
    const { error, loading, data } = useQuery(LOAD_RECIPES)

    useEffect(()=>{
        if(data) console.log(data);
    },[data])

  return (
    <div>GetRecipe</div>
  )
}

export default GetRecipe