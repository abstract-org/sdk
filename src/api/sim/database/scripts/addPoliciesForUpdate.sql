CREATE POLICY "Allow agora to update" ON snapshot FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON snapshot_investor FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON snapshot_pool FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON swap FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON snapshot_quest FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON snapshot_totals FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

-- CREATE POLICY "Allow agora to update" ON user FOR UPDATE TO authenticated
-- WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON _prisma_migrations FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON investor FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON investor_balances FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON investor_navs FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON log FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON pool FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON pool_data FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON position FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON position_owner FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON quest FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON scenario FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON scenario_investor_config FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

CREATE POLICY "Allow agora to update" ON scenario_quest_config FOR UPDATE TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');
