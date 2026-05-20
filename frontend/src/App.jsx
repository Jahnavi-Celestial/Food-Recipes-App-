import {ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from} from '@apollo/client';
import {onError} from '@apollo/client/link/error';

const errorLink = onError(({graphqlError, networkError}) => {
  if(graphqlError){
    graphqlError.map(({message, location, path}) => {
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

  </ApolloProvider>
}

export default App;