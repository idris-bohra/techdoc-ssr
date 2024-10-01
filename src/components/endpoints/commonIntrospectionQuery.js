export const introspectionQuery = `query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              name
              kind
            }
          }
          type {
            name
            kind
          }
        }
      }
      mutationType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              name
              kind
            }
          }
          type {
            name
            kind
          }
        }
      }
      subscriptionType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              name
              kind
            }
          }
          type {
            name
            kind
          }
        }
      }
      types {
        name
        kind
        description
        fields {
          name
          description
          args {
            name
            description
            type {
              name
              kind
            }
          }
          type {
            name
            kind
          }
        }
        inputFields {
          name
          description
          type {
            name
            kind
          }
        }
        enumValues {
          name
          description
        }
        possibleTypes {
          name
        }
      }
    }
  }`