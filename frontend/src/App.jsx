import {ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import GetRecipe from './components/GetRecipe';

const errorLink = onError(({graphqlError}) => {
  if(graphqlError){
    graphqlError.map(({message}) => {
      alert(`Graphql error ${message}`);
    })
  }
})

const link = from([
  errorLink, 
  new HttpLink({uri: "http://localhost:3000/graphql"}),
])

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link
})


function App(){
  return <ApolloProvider client={client}>
    <GetRecipe/>
  </ApolloProvider>
}

export default App;