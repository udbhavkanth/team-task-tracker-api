/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Returns server health status. No authentication required.
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: ok
 *               message: Server is running
 */

export {};
