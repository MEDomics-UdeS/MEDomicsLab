import React, { useEffect } from "react"

const Dashboard = () => {
  useEffect(() => {
    console.log("Dashboard")
  }, [])
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}

export default Dashboard
