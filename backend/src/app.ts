import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { verifyToken, type AuthedRequest } from './middleware/auth.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const port = Number(process.env.PORT) || 3000

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'PainLog API', 
    docs: '/health',
    api: '/api/pain-entries (PROTEGIDO)'
  });
});

app.use('/api/pain-entries', verifyToken)
app.use('/api/medication-entries', verifyToken)
app.use('/api/medication', verifyToken)


//________________________________________________________________________
//PAIN ENTRIES ENDPOINTS


//LISTA TODAS AS PainEntries 
app.get('/api/pain-entries', async (request, response) => {
  try {
    const req = request as AuthedRequest
    const userId = req.user?.id

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { data, error } = await supabase //"fala" com o supabase para pedir o que é necessário
      .from('PainEntries')   
      .select('*')           // SELECT * FROM "PainEntries" no supabase
      .eq('userId', userId) 

    if (error) {
      // Supabase devolveu erro (tabela não existe, sem permissões, etc.)
      return response.status(500).json({ error: error.message }) //Envia mensagem de erro para Postman
    }

    if (!data) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    // sucesso: devolve array de registos
    return response.json(data) // Envia array para Postman
  } catch {
    //  Erro JavaScript (não Supabase): variável undefined, etc.
    return response.status(500).json({ error: 'Server Error' })
  }
})


//LISTA UMA PAIN ENTRY
app.get('/api/pain-entries/:id', async (request, response) => {
  try { 
    const req = request as AuthedRequest
    const userId = req.user?.id

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = request.params as { id: string }  // Extrai o ID da URL 
    
    const { data, error } = await supabase
      .from('PainEntries')
      .select('*')      // SELECT * FROM "PainEntries"
      .eq('id', id)
      .eq('userId', userId)     // WHERE id = :id
      .single()         // Apenas 1 registo

    if (error) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    return response.json(data)
    
  } catch {
    
    return response.status(500).json({ error: 'Server Error' })
  }
})


//ADICIONAR NOVA PAINENTRY
//ATENÇÃO!!!!!!! AO TESTAR POST REMOVI CONSTRAITS, DEPOIS ALTERAR, 
// ALTER TABLE "PainEntries" 
// ADD CONSTRAINT "PainEntries_userId_fkey" 
// FOREIGN KEY ("userId") REFERENCES auth.users(id);

app.post('/api/pain-entries', async (request, response) => { 
  try {
    const req = request as AuthedRequest
    const userId = req.user?.id

    console.log('AUTH USER ID:', userId)
    console.log('BODY:', request.body)

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { 
      painLocation, 
      painIntensity, 
      painType, 
      hasTakenMedication, 
      energyLevel, 
      sleepHours, 
      notes
    } = request.body //vai buscar os dados necessários 

    const trimmedPainLocation = String(painLocation ?? '').trim()
    const trimmedPainType = String(painType ?? '').trim()
    const numericPainIntensity = Number(painIntensity)
    const numericEnergyLevel = Number(energyLevel)
    const numericSleepHours = Number(sleepHours)
    const medicationTaken = Boolean(hasTakenMedication)

    if (
      !trimmedPainLocation ||
      !trimmedPainType ||
      painIntensity === '' ||
      energyLevel === '' ||
      sleepHours === '' ||
      painIntensity === null ||
      painIntensity === undefined ||
      energyLevel === null ||
      energyLevel === undefined ||
      sleepHours === null ||
      sleepHours === undefined ||
      Number.isNaN(numericPainIntensity) ||
      Number.isNaN(numericEnergyLevel) ||
      Number.isNaN(numericSleepHours)
    ) {
      return response.status(400).json({ error: 'Missing mandatory fields!' })
    }

    const { data, error } = await supabase // Insere os dados na tabela 'PainEntries' do Supabase 
      .from('PainEntries')
      .insert({ 
        painLocation: trimmedPainLocation,
        painIntensity: numericPainIntensity,
        painType: trimmedPainType,
        hasTakenMedication: medicationTaken,
        energyLevel: numericEnergyLevel,
        sleepHours: numericSleepHours,
        notes: notes?.trim() || null,
        userId
      })
      .select()
      .single()

    if (error) 
      return response.status(500).json({ error: error.message })

    return response.status(201).json(data)
    
  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


//ATUALIZA TUDO
app.put('/api/pain-entries/:id', async (request, response) => {
  try {
    const req = request as AuthedRequest
    const userId = req.user?.id

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = request.params as { id: string }  // Extrai o ID da URL 
    
    if (!request.body) { // Verifica se o body da requisição existe
      return response.status(400).json({ error: 'Request body is required!' })
    }

    const {  // Extrai os dados enviados no corpo da requisição
      painLocation, 
      painIntensity, 
      painType, 
      hasTakenMedication, 
      energyLevel, 
      sleepHours, 
      notes
    } = request.body

    const required = {  // Cria objeto com campos OBRIGATÓRIOS e valida se todos existem
      painLocation, 
      painIntensity, 
      painType, 
      hasTakenMedication, 
      energyLevel, 
      sleepHours
    }
    
    const missingFields = Object.entries(required) // Verifica campos que estão em falta (ignora 0 e false que são válidos)
      .filter(([, value]) => !value && value !== 0 && value !== false)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return response.status(400).json({ 
        error: `Missing mandatory fields: ${missingFields.join(', ')}` 
      })
    }

    // Verifica se existe um registo com este ID 
    const { data: existing } = await supabase
      .from('PainEntries')  // Seleciona a tabela PainEntries
      .select('id')         // Só vai buscar o campo id 
      .eq('id', id)         // WHERE 
      .eq('userId', userId)
      .single()             // Pega apenas UM registo

    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    // UPDATE
    const { data, error } = await supabase
      .from('PainEntries')
      .update({ 
        painLocation: String(painLocation).trim(),
        painIntensity: Number(painIntensity),
        painType: String(painType).trim(),
        hasTakenMedication: Boolean(hasTakenMedication),
        energyLevel: Number(energyLevel),
        sleepHours: Number(sleepHours),
        notes: notes ? String(notes).trim() : null
      })
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


//ATUALIZA PARCIALMENTE
app.patch('/api/pain-entries/:id', async (request, response) => {
  try {
    // Extrai o ID da URL (ex: /api/pain-entries/a106b83a...)
    const req = request as AuthedRequest
    const userId = req.user?.id

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = request.params as { id: string }

    // Verifica se o body da requisição existe
    if (!request.body) {
      return response.status(400).json({ error: 'Request body is required!' })
    }

    // Extrai os dados enviados (campos opcionais - PATCH só atualiza o que vem)
    const { 
      painLocation, 
      painIntensity, 
      painType, 
      hasTakenMedication, 
      energyLevel, 
      sleepHours, 
      notes
    } = request.body

    // Verifica se o registo existe
    const { data: existing } = await supabase
      .from('PainEntries')
      .select('*')       // Pega TODOS os campos atuais
      .eq('id', id)
      .eq('userId', userId)
      .single()

    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    //  PATCH: só atualiza campos que foram enviados (ignora nulos/vazios)
    const updateData: Record<string, unknown> = {}

    if (painLocation !== undefined) updateData.painLocation = String(painLocation).trim()
    if (painIntensity !== undefined) updateData.painIntensity = Number(painIntensity)
    if (painType !== undefined) updateData.painType = String(painType).trim()
    if (hasTakenMedication !== undefined) updateData.hasTakenMedication = Boolean(hasTakenMedication)
    if (energyLevel !== undefined) updateData.energyLevel = Number(energyLevel)
    if (sleepHours !== undefined) updateData.sleepHours = Number(sleepHours)
    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null

    // Se nenhum campo para atualizar, retorna 400
    if (Object.keys(updateData).length === 0) {
      return response.status(400).json({ error: 'No fields to update!' })
    }

    // ATUALIZA apenas os campos fornecidos
    const { data, error } = await supabase
      .from('PainEntries')
      .update(updateData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


//APAGA UMA ENTRY
app.delete('/api/pain-entries/:id', async (request, response) => {
  try{
    const req = request as AuthedRequest
    const userId = req.user?.id

    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = request.params as { id: string }

    // Verifica se o registo com o Id existe
    const { data: existing } = await supabase
      .from('PainEntries')  
      .select('id')         
      .eq('id', id)         
      .eq('userId', userId)
      .single()   
    
    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    // APAGA 
    const { data, error } = await supabase
      .from('PainEntries')  // Seleciona a tabela PainEntries
      .delete()             // DELETE FROM "PainEntries"
      .eq('id', id)         
      .eq('userId', userId)
      .select()             // Retorna o registo APAGADO
      .single()             // Apenas 1 registo

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


//________________________________________________________________________
//MEDICATION ENDPOINTS


app.get('/api/medication', async (request, response) => {
  try {
    const { data, error } = await supabase 
      .from('Medication')   
      .select('*')           

    if (error) {
      return response.status(500).json({ error: error.message }) 
    }

    return response.json(data) 
  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.get('/api/medication/:id', async (request, response) => {
  try{
    const { id } = request.params as { id: string }

    const { data, error } = await supabase
      .from('Medication')
      .select('*')      
      .eq('id', id)     
      .single() 

     if (error) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    return response.json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.post('/api/medication', async (request, response) => {
  try {
    const { 
      name,
      dosage 
    } = request.body 

    const required = { name, dosage } 

    if (Object.values(required).some(value => !value)) { 
      return response.status(400).json({ error: 'Missing mandatory fields!' })
    }

    const { data, error } = await supabase
      .from('Medication')
      .insert({ 
        name: String(name).trim(),
        dosage: String(dosage).trim()
      })
      .select()
      .single()

    if (error) 
      return response.status(500).json({ error: error.message })

    return response.status(201).json(data)
    
  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.put('/api/medication/:id', async (request, response) => {
  try {
    const { id } = request.params as { id: string }  
    
    if (!request.body) { 
      return response.status(400).json({ error: 'Request body is required!' })
    }

    const {  
      name, 
      dosage 
    } = request.body

    const required = {  
      name, 
      dosage 
    }
    
    const missingFields = Object.entries(required) 
      .filter(([, value]) => !value && value !== 0 && value !== false)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return response.status(400).json({ 
        error: `Missing mandatory fields: ${missingFields.join(', ')}` 
      })
    }
 
    const { data: existing } = await supabase
      .from('Medication')  
      .select('id')          
      .eq('id', id)          
      .single()             

    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    const { data, error } = await supabase
      .from('Medication')
      .update({ 
        name: String(name).trim(),
        dosage: String(dosage).trim()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.patch('/api/medication/:id', async (request, response) => {
  try {
    const { id } = request.params as { id: string }

    if (!request.body) {
      return response.status(400).json({ error: 'Request body is required!' })
    }

    const { 
      name, 
      dosage 
    } = request.body

    const { data: existing } = await supabase
      .from('Medication')
      .select('*')     
      .eq('id', id)
      .single()

    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    const updateData: Record<string, unknown> = {}
    
    if (name !== undefined) updateData.name = String(name).trim()
    if (dosage !== undefined) updateData.dosage = String(dosage).trim()
    
    if (Object.keys(updateData).length === 0) {
      return response.status(400).json({ error: 'No fields to update!' })
    }

    const { data, error } = await supabase
      .from('Medication')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.delete('/api/medication/:id', async (request, response) => {
  try{
    const { id } = request.params as { id: string }

    const { data: existing } = await supabase
      .from('Medication')  
      .select('id')         
      .eq('id', id)         
      .single()   
    
    if (!existing) {
      return response.status(404).json({ error: 'Entry not found' })
    }

    const { data, error } = await supabase
      .from('Medication')  
      .delete()             
      .eq('id', id)         
      .select()             
      .single()             

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(200).json(data)

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


//_________________________________________________________________________
//MEDICATIONENTRIES 

app.get('/api/medication-entries', async (request, response) => {
  try {
    const { data, error } = await supabase 
      .from('MedicationEntries')  
      .select(`*`)

    if (error) {
      return response.status(500).json({ error: error.message }) 
    }

    return response.json(data) 
    
  } catch {
    return response.status(500).json({ error: 'Server Error' })
    
  }
})


app.post('/api/medication-entries', async (request, response) => {
  try {
    const { painEntriesId, medicationId } = request.body

    if (!painEntriesId || !medicationId) {
      return response.status(400).json({ error: 'painEntriesId and medicationId required!' })
    }

    const { data, error } = await supabase
      .from('MedicationEntries')
      .insert({ 
        painEntriesId: painEntriesId,
        medicationId: medicationId
      })
      .select()
      .single()

    if (error) {
      return response.status(500).json({ error: error.message })
    }

    return response.status(201).json(data)
  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})


app.delete('/api/medication-entries/:id', async (request, response) => {
  try {
    
    const { id } = request.params as { id: string }

    const { data: existing } = await supabase
      .from('MedicationEntries')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return response.status(404).json({ error: 'Link not found' })
    }

    const { error } = await supabase
      .from('MedicationEntries')
      .delete()
      .eq('id', id)

    if (error) return response.status(500).json({ error: error.message })
    return response.status(204).send()

  } catch {
    return response.status(500).json({ error: 'Server Error' })
  }
})

app.listen(port, () => console.log(`Server running on port ${port}`))
