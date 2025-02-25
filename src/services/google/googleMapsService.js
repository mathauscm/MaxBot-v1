const axios = require('axios');
const environment = require('../../config/enviroment');

/**
 * Serviço para interação com a API do Google Maps
 * 
 * Fornece métodos estáticos para busca de locais utilizando a API de Pesquisa de Locais do Google
 * 
 * @class
 */
class GoogleMapsService {
    /**
     * Busca locais baseado em uma consulta de texto
     * 
     * Realiza uma pesquisa de locais usando a API do Google Places, 
     * com suporte para localização específica e filtros padrão
     * 
     * @static
     * @async
     * @param {string} query - Termo de busca para locais (por exemplo, "restaurantes", "academias")
     * @param {string} [location='Ubajara,CE'] - Localização de referência para a busca
     * @returns {Promise<Array<Object>>} Lista de locais encontrados com detalhes
     * @throws {Error} Erro durante a busca de locais
     * 
     * @example
     * // Busca restaurantes em Ubajara
     * const locais = await GoogleMapsService.buscarLocais('restaurantes');
     * 
     * @example
     * // Busca academias em uma localização específica
     * const locais = await GoogleMapsService.buscarLocais('academias', 'Tianguá,CE');
     */
    static async buscarLocais(query, location = 'Ubajara,CE') {
        try {
            // Realiza requisição à API do Google Places
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
                params: {
                    query: query,
                    location: location,
                    radius: '5000', // Raio de busca em metros (5km)
                    language: 'pt-BR', // Idioma dos resultados
                    key: process.env.GOOGLE_MAPS_API_KEY // Chave de API
                }
            });

            // Formata os resultados para um formato mais simples e útil
            const lugares = response.data.results.map(place => ({
                /** Nome do local */
                nome: place.name,
                /** Endereço completo */
                endereco: place.formatted_address,
                /** Avaliação média (de 0 a 5) */
                avaliacao: place.rating,
                /** Número total de avaliações */
                total_avaliacoes: place.user_ratings_total,
                /** Status de abertura atual */
                aberto: place.opening_hours?.open_now,
                /** Latitude do local */
                latitude: place.geometry.location.lat,
                /** Longitude do local */
                longitude: place.geometry.location.lng
            }));

            // Retorna os 3 melhores resultados
            return lugares.slice(0, 3);
        } catch (error) {
            // Log e tratamento de erro
            console.error('Erro ao buscar locais:', error);
            throw new Error('Falha ao buscar locais no Google Maps');
        }
    }
}

/**
 * Módulo de serviço para consultas ao Google Maps
 * @module GoogleMapsService
 */
module.exports = GoogleMapsService;