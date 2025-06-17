// Direct MCP communication test
const { spawn } = require('child_process')

async function testMCPDirect() {
  console.log('🚀 Testing direct MCP communication...')
  
  const env = {
    ...process.env,
    SUPABASE_URL: 'https://dzffzvqrmhdlpmyvxriy.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg'
  }
  
  const mcp = spawn('supabase-mcp-claude', [], { 
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  })
  
  return new Promise((resolve, reject) => {
    let output = ''
    let errorOutput = ''
    
    mcp.stdout.on('data', (data) => {
      output += data.toString()
      console.log('📤 MCP Output:', data.toString())
    })
    
    mcp.stderr.on('data', (data) => {
      errorOutput += data.toString()
      console.log('❌ MCP Error:', data.toString())
    })
    
    // Send MCP request to list tables
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "listTables",
        arguments: {}
      }
    }
    
    setTimeout(() => {
      console.log('📨 Sending MCP request:', JSON.stringify(request))
      mcp.stdin.write(JSON.stringify(request) + '\n')
    }, 1000)
    
    mcp.on('close', (code) => {
      console.log(`🏁 MCP process exited with code ${code}`)
      console.log('📄 Full output:', output)
      console.log('⚠️ Error output:', errorOutput)
      
      if (code === 0) {
        resolve(output)
      } else {
        reject(new Error(`MCP failed with code ${code}: ${errorOutput}`))
      }
    })
    
    // Timeout after 10 seconds
    setTimeout(() => {
      mcp.kill()
      reject(new Error('MCP timeout'))
    }, 10000)
  })
}

testMCPDirect().then(result => {
  console.log('✅ MCP SUCCESS:', result)
}).catch(err => {
  console.error('💥 MCP FAILED:', err.message)
})