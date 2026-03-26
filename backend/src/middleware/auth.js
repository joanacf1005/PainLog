import { createClient } from '@supabase/supabase-js'; //Traz a função para criar o cliente Supabase
import dotenv from 'dotenv';
dotenv.config(); //Lê o ficheiro .env e mete SUPABASE_URL e SUPABASE_SECRET_KEY nas variáveis process.env abaixo
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey); //CRIA o cliente Supabase com as credenciais
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Pega o cabeçalho Authorization do pedido
    if (!authHeader || !authHeader.startsWith('Bearer ')) { //verifica se existe o cabeçalho e se começa com bearer
        return res.status(401).json({ erro: 'Access denied. Token not found or invalid format.' });
    }
    const token = authHeader.split(' ')[1]; //corta para ficar o token puro
    const { data, error } = await supabase.auth.getUser(token); //verifica se é válido e quem é o dono
    if (error || !data.user) {
        return res.status(401).json({ erro: 'Invalid or expired token.' });
    }
    req.user = { id: data.user.id };
    next();
};
//# sourceMappingURL=auth.js.map