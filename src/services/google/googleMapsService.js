const axios = require('axios');
const environment = require('../../config/enviroment');

class GoogleMapsService {
    static async buscarLocais(query, location = 'Ubajara,CE') {
        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
                params: {
                    query: query,
                    location: location,
                    radius: '5000', // 5km
                    language: 'pt-BR',
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });

            // Formata os resultados
            const lugares = response.data.results.map(place => ({
                nome: place.name,
                endereco: place.formatted_address,
                avaliacao: place.rating,
                total_avaliacoes: place.user_ratings_total,
                aberto: place.opening_hours?.open_now,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
            }));

            return lugares.slice(0, 3); // Retorna os 3 melhores resultados
        } catch (error) {
            console.error('Erro ao buscar locais:', error);
            throw new Error('Falha ao buscar locais no Google Maps');
        }
    }
}

module.exports = GoogleMapsService;