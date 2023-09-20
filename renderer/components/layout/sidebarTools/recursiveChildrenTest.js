// This is a test layout model that will be used to test the sidebar
var recursiveChildrenTest = {
  name: "Test page",
  children: [
    {
      name: "Input page",
      children: [
        {
          name: "Extraction page",
          children: [
            {
              name: "Discovery page",
              children: [
                {
                  name: "Learning page",
                  children: [
                    {
                      name: "Results page",
                      children: [
                        {
                          name: "Application page"
                        },
                        {
                          name: "Application page2"
                        }
                      ]
                    },
                    {
                      name: "Results page2",
                      children: [
                        {
                          name: "Application page3"
                        },
                        {
                          name: "Application page4"
                        }
                      ]
                    },
                    {
                      name: "Results page3"
                    }
                  ]
                },
                {
                  name: "Learning page2"
                }
              ]
            },
            {
              name: "Discovery page2",
              children: [
                {
                  name: "Learning page3"
                },
                {
                  name: "Learning page4"
                }
              ]
            },
            {
              name: "Discovery page3"
            }
          ]
        }
      ]
    }
  ]
}

export default recursiveChildrenTest
